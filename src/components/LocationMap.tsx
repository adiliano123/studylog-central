import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MapPin, RefreshCw, Navigation, Clock, AlertTriangle } from "lucide-react";

// Fix Leaflet's default marker icon broken by Vite's asset pipeline
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Custom blue pulsing icon for the student's current position
const studentIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface LocationData {
  id?: number;
  latitude: number;
  longitude: number;
  address?: string;
  capturedAt: string;
}

interface RecenterProps {
  lat: number;
  lng: number;
}

// Component that programmatically re-centres the map when coordinates change
const Recenter = ({ lat, lng }: RecenterProps) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 15, { animate: true });
  }, [lat, lng, map]);
  return null;
};

interface LocationMapProps {
  /** When true the component operates in read-only/view mode (supervisors/admins) */
  readOnly?: boolean;
  /** Pre-loaded location to show in read-only mode */
  initialLocation?: LocationData;
  /** Student id used in read-only mode to fetch from the API */
  studentId?: number;
}

const LocationMap = ({
  readOnly = false,
  initialLocation,
  studentId,
}: LocationMapProps) => {
  const [location, setLocation] = useState<LocationData | null>(
    initialLocation ?? null
  );
  const [locationHistory, setLocationHistory] = useState<LocationData[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const { toast } = useToast();

  // Reverse-geocode via Nominatim (free, no key required)
  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`,
        { headers: { "Accept-Language": "en" } }
      );
      if (!res.ok) return "";
      const data = await res.json();
      return data.display_name ?? "";
    } catch {
      return "";
    }
  };

  // Save location to backend
  const saveLocation = useCallback(
    async (lat: number, lng: number, address: string) => {
      const token = localStorage.getItem("token");
      if (!token || readOnly) return;

      try {
        const payload = {
          latitude: lat,
          longitude: lng,
          address,
          capturedAt: new Date().toISOString(),
        };

        const res = await fetch("http://localhost:8080/api/locations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const saved: LocationData = await res.json();
          setLocation(saved);
        }
      } catch (err) {
        console.error("Failed to save location:", err);
      }
    },
    [readOnly]
  );

  // Capture current GPS position, reverse-geocode, save
  const captureLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support location access.",
        variant: "destructive",
      });
      return;
    }

    setIsLocating(true);
    setPermissionDenied(false);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const address = await reverseGeocode(latitude, longitude);
        const captured: LocationData = {
          latitude,
          longitude,
          address,
          capturedAt: new Date().toISOString(),
        };
        setLocation(captured);
        await saveLocation(latitude, longitude, address);
        setIsLocating(false);

        toast({
          title: "Location updated",
          description: address || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
        });
      },
      (err) => {
        setIsLocating(false);
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionDenied(true);
          toast({
            title: "Location permission denied",
            description:
              "Please allow location access in your browser settings.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Location unavailable",
            description: "Unable to retrieve your current position.",
            variant: "destructive",
          });
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, [saveLocation, toast]);

  // Fetch location history
  const fetchHistory = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const url =
      readOnly && studentId
        ? `http://localhost:8080/api/locations/student/${studentId}/history`
        : "http://localhost:8080/api/locations/my/history";

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: LocationData[] = await res.json();
        setLocationHistory(data);
        // In read-only mode, show the most recent location
        if (readOnly && data.length > 0 && !initialLocation) {
          setLocation(data[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch location history:", err);
    }
  }, [readOnly, studentId, initialLocation]);

  // On mount: auto-capture (student) or fetch (supervisor/admin)
  useEffect(() => {
    if (readOnly) {
      fetchHistory();
    } else {
      captureLocation();
      fetchHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Navigation className="h-5 w-5 text-primary" />
              {readOnly ? "Student Location" : "My Current Location"}
            </CardTitle>
            <CardDescription>
              {readOnly
                ? "Most recent recorded position"
                : "Your live training location — captured automatically"}
            </CardDescription>
          </div>
          {!readOnly && (
            <Button
              variant="outline"
              size="sm"
              onClick={captureLocation}
              disabled={isLocating}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLocating ? "animate-spin" : ""}`}
              />
              {isLocating ? "Locating…" : "Refresh"}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Permission denied banner */}
        {permissionDenied && (
          <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              Location access was denied. Open your browser settings and allow
              location for this page, then click <strong>Refresh</strong>.
            </p>
          </div>
        )}

        {/* Location details strip */}
        {location && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg text-sm">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Coordinates
                </p>
                <p className="font-mono">
                  {location.latitude.toFixed(6)},{" "}
                  {location.longitude.toFixed(6)}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Clock className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  Captured
                </p>
                <p>{formatDate(location.capturedAt)}</p>
              </div>
            </div>
            {location.address && (
              <div className="sm:col-span-2 flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    Address
                  </p>
                  <p className="text-muted-foreground">{location.address}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Map */}
        <div className="rounded-lg overflow-hidden border" style={{ height: 320 }}>
          {location ? (
            <MapContainer
              center={[location.latitude, location.longitude]}
              zoom={15}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Recenter lat={location.latitude} lng={location.longitude} />
              <Marker
                position={[location.latitude, location.longitude]}
                icon={studentIcon}
              >
                <Popup>
                  <div className="text-sm space-y-1 min-w-[180px]">
                    <p className="font-semibold">📍 Current Location</p>
                    {location.address && (
                      <p className="text-gray-600 text-xs">{location.address}</p>
                    )}
                    <p className="text-gray-500 text-xs">
                      {location.latitude.toFixed(6)},{" "}
                      {location.longitude.toFixed(6)}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {formatDate(location.capturedAt)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div className="h-full flex items-center justify-center bg-muted/30">
              {isLocating ? (
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    Detecting location…
                  </p>
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <MapPin className="h-10 w-10 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground">
                    No location data yet
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Location history (last 5) */}
        {locationHistory.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
              Recent locations
            </p>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {locationHistory.slice(0, 5).map((h, i) => (
                <div
                  key={h.id ?? i}
                  className="flex items-center justify-between p-2 rounded-md bg-muted/40 text-xs"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                    <span className="truncate text-muted-foreground">
                      {h.address
                        ? h.address.split(",").slice(0, 2).join(",")
                        : `${h.latitude.toFixed(4)}, ${h.longitude.toFixed(4)}`}
                    </span>
                  </div>
                  <Badge variant="secondary" className="ml-2 flex-shrink-0 text-xs">
                    {formatDate(h.capturedAt)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationMap;

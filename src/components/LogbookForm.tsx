import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface LogbookFormProps {
  onSuccess: () => void;
}

const LogbookForm = ({ onSuccess }: LogbookFormProps) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    hoursWorked: "",
    activities: "",
    weekNumber: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      toast({
        title: "Authentication Error",
        description: "Please log in again.",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload = {
        date: formData.date,
        hoursWorked: parseFloat(formData.hoursWorked),
        activities: formData.activities,
        weekNumber: formData.weekNumber ? parseInt(formData.weekNumber) : undefined
      };

      const response = await fetch("http://localhost:8080/api/logbooks/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          hoursWorked: "",
          activities: "",
          weekNumber: ""
        });
        onSuccess();
      } else {
        const errorData = await response.json();
        toast({
          title: "Failed to Create Entry",
          description: errorData.message || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Network Error",
        description: "Unable to connect to server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Logbook Entry</CardTitle>
        <CardDescription>
          Record your daily activities and hours worked
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hoursWorked">Hours Worked</Label>
              <Input
                id="hoursWorked"
                name="hoursWorked"
                type="number"
                step="0.5"
                min="0"
                max="24"
                placeholder="e.g., 7.5"
                value={formData.hoursWorked}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weekNumber">Week Number (Optional)</Label>
              <Input
                id="weekNumber"
                name="weekNumber"
                type="number"
                min="1"
                max="52"
                placeholder="e.g., 3"
                value={formData.weekNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="activities">Description of Activities</Label>
            <Textarea
              id="activities"
              name="activities"
              placeholder="Describe what you worked on today..."
              rows={5}
              value={formData.activities}
              onChange={handleChange}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Entry"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LogbookForm;
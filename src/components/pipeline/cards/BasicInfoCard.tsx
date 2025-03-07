import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface BasicInfoCardProps {
  pipelineName: string;
  setPipelineName: (value: string) => void;
  focus: string;
  setFocus: (value: string) => void;
  schedule: string;
  setSchedule: (value: string) => void;
  deliveryTime: string;
  setDeliveryTime: (value: string) => void;
  isActive: boolean;
  setIsActive: (value: boolean) => void;
  error: string | null;
}

export const BasicInfoCard = ({
  pipelineName,
  setPipelineName,
  focus,
  setFocus,
  schedule,
  setSchedule,
  deliveryTime,
  setDeliveryTime,
  isActive,
  setIsActive,
  error
}: BasicInfoCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Basic Information</CardTitle>
        <CardDescription>
          Configure the basic settings for your content pipeline.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="pipeline-name" className="flex items-center">
            Pipeline Name <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input 
            id="pipeline-name" 
            placeholder="My News Pipeline" 
            value={pipelineName}
            onChange={(e) => setPipelineName(e.target.value)}
            required
            className={!pipelineName.trim() && error ? "border-red-500" : ""}
          />
          {!pipelineName.trim() && error && (
            <p className="text-sm text-red-500">Pipeline name is required</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="focus" className="flex items-center">
            Focus <span className="text-red-500 ml-1">*</span>
          </Label>
          <Input 
            id="focus" 
            placeholder="Technology, Politics, Sports, etc." 
            value={focus}
            onChange={(e) => setFocus(e.target.value)}
            required
            className={!focus.trim() && error ? "border-red-500" : ""}
          />
          {!focus.trim() && error && (
            <p className="text-sm text-red-500">Focus is required</p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="schedule">Schedule</Label>
            <Select 
              value={schedule} 
              onValueChange={setSchedule}
            >
              <SelectTrigger id="schedule">
                <SelectValue placeholder="Select schedule" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="delivery-time">Delivery Time</Label>
            <Input 
              id="delivery-time" 
              type="time" 
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              required
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Switch 
            id="is-active" 
            checked={isActive}
            onCheckedChange={setIsActive}
          />
          <Label htmlFor="is-active">Active</Label>
        </div>
      </CardContent>
    </Card>
  );
};

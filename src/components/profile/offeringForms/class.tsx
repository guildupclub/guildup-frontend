import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    OFFERING_TYPES,
    StringConstants,
} from "@/components/common/CommonText";
import { Switch } from "@/components/ui/switch";
import { Calendar, Clock } from "lucide-react";

interface ClassFormData {
    title: string;
    description: string;
    type: string;
    total_price: number;
    // discounted_price: number;
    payment_mode: string;
    schedule: {
        days_of_week: string[];
        time: string;
    };
    start_date: string;
    duration_per_session: number;
    is_private: boolean;
    meeting_link_option: string;
    custom_meeting_link: string;
    max_attendees: number;
    tags: string;
}

interface ClassFormProps {
    formData: ClassFormData;
    setFormData: React.Dispatch<React.SetStateAction<any>>;
    handleOfferingSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    offeringCreated: boolean;
}

const daysOfWeek = [
    { value: "monday", label: "Mon" },
    { value: "tuesday", label: "Tue" },
    { value: "wednesday", label: "Wed" },
    { value: "thursday", label: "Thu" },
    { value: "friday", label: "Fri" },
    { value: "saturday", label: "Sat" },
    { value: "sunday", label: "Sun" },
];

const ClassForm = ({
    formData,
    setFormData,
    handleOfferingSubmit,
    loading,
    offeringCreated,
}: ClassFormProps) => {
    
    const handleDayToggle = (day: string) => {
        const currentDays = formData.schedule?.days_of_week || [];
        let updatedDays;
        
        if (currentDays.includes(day)) {
            updatedDays = currentDays.filter(d => d !== day);
        } else {
            updatedDays = [...currentDays, day];
        }
        
        setFormData({
            ...formData,
            schedule: {
                ...formData.schedule,
                days_of_week: updatedDays
            }
        });
    };

    return (
        <form onSubmit={handleOfferingSubmit} className="space-y-6">
            {/* Class Details Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Class Details</h3>
                
                <div className="space-y-2">
                    <Label htmlFor="title">
                        Title<span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="Evening Yoga Batch – 7 PM"
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">
                        Description<span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                description: e.target.value,
                            })
                        }
                        placeholder="Relaxing yoga sessions for all levels. Perfect for beginners and experienced practitioners..."
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="type">
                        Type<span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={formData.type}
                        onValueChange={(value) =>
                            setFormData({ ...formData, type: value })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select your offering type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="consultation">
                                {OFFERING_TYPES.CONSULTATION}
                            </SelectItem>
                            <SelectItem value="webinar">
                                {OFFERING_TYPES.WEBINAR}
                            </SelectItem>
                            <SelectItem value="package">
                                Package
                            </SelectItem>
                            <SelectItem value="class">
                                Class
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="tags">
                        Tags (comma separated)
                    </Label>
                    <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) =>
                            setFormData({ ...formData, tags: e.target.value })
                        }
                        placeholder="yoga, fitness, wellness, beginner-friendly"
                    />
                </div>
            </div>

            {/* Pricing Section */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Pricing</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="total_price">
                            Monthly Price ({StringConstants.INR})
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="total_price"
                            type="number"
                            value={formData.total_price}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    total_price: Number(e.target.value),
                                })
                            }
                            required
                        />
                    </div>

                    {/* <div className="space-y-2">
                        <Label htmlFor="discounted_price">
                            Discounted Price ({StringConstants.INR})
                        </Label>
                        <Input
                            id="discounted_price"
                            type="number"
                            value={formData.discounted_price}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    discounted_price: Number(e.target.value),
                                })
                            }
                        />
                    </div> */}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="payment_mode">
                            Payment Mode<span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={formData.payment_mode}
                            onValueChange={(value) =>
                                setFormData({ ...formData, payment_mode: value })
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select payment mode" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="upfront">Upfront (1 Month)</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="max_attendees">
                            Max Attendees
                        </Label>
                        <Input
                            id="max_attendees"
                            type="number"
                            value={formData.max_attendees}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    max_attendees: Number(e.target.value),
                                })
                            }
                            placeholder="50"
                        />
                    </div>
                </div>
            </div>

            {/* Schedule Configuration */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Schedule Configuration</h3>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="start_date">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            Start Date<span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="start_date"
                            type="date"
                            value={formData.start_date}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    start_date: e.target.value,
                                })
                            }
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="duration_per_session">
                            <Clock className="w-4 h-4 inline mr-1" />
                            Duration per Session (minutes)
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="duration_per_session"
                            type="number"
                            value={formData.duration_per_session}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    duration_per_session: Number(e.target.value),
                                })
                            }
                            placeholder="60"
                            required
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="schedule_time">
                        Class Time<span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="schedule_time"
                        type="time"
                        value={formData.schedule?.time || ""}
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                schedule: {
                                    ...formData.schedule,
                                    time: e.target.value
                                }
                            })
                        }
                        required
                    />
                </div>

                <div className="space-y-3">
                    <Label>
                        Days of Week<span className="text-red-500">*</span>
                    </Label>
                    <div className="grid grid-cols-4 gap-2">
                        {daysOfWeek.map((day) => (
                            <Button
                                key={day.value}
                                type="button"
                                variant={
                                    formData.schedule?.days_of_week?.includes(day.value) 
                                        ? "default" 
                                        : "outline"
                                }
                                className="h-10 text-sm"
                                onClick={() => handleDayToggle(day.value)}
                            >
                                {day.label}
                            </Button>
                        ))}
                    </div>
                    {formData.schedule?.days_of_week?.length > 0 && (
                        <div className="text-sm text-muted-foreground">
                            Selected: {formData.schedule.days_of_week.join(", ")}
                        </div>
                    )}
                </div>
            </div>

            {/* Meeting Configuration */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Meeting Configuration</h3>
                
                <div className="space-y-2">
                    <Label htmlFor="meeting_link_option">
                        Meeting Link Option<span className="text-red-500">*</span>
                    </Label>
                    <Select
                        value={formData.meeting_link_option}
                        onValueChange={(value) =>
                            setFormData({ ...formData, meeting_link_option: value })
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select meeting link option" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="auto_generate">
                                Auto-generate recurring link
                            </SelectItem>
                            <SelectItem value="custom">
                                Use custom meeting link
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {formData.meeting_link_option === "custom" && (
                    <div className="space-y-2">
                        <Label htmlFor="custom_meeting_link">
                            Custom Meeting Link<span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="custom_meeting_link"
                            type="url"
                            value={formData.custom_meeting_link}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    custom_meeting_link: e.target.value,
                                })
                            }
                            placeholder="https://zoom.us/j/..."
                            required={formData.meeting_link_option === "custom"}
                        />
                    </div>
                )}

                <div className="flex items-center space-x-2">
                    <Switch
                        id="is_private"
                        checked={formData.is_private}
                        onCheckedChange={(checked) =>
                            setFormData({ ...formData, is_private: checked })
                        }
                    />
                    <Label htmlFor="is_private">
                        Private Class (Custom offer - wont&apos;t appear on your public profile)
                    </Label>
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <Button
                    type="submit"
                    className="bg-primary text-white"
                    disabled={
                        loading || 
                        offeringCreated || 
                        !formData.schedule?.days_of_week?.length ||
                        !formData.schedule?.time
                    }
                >
                    {loading
                        ? "Creating..."
                        : offeringCreated
                        ? "Created!"
                        : "Create Class"}
                </Button>
            </div>
        </form>
    );
};

export default ClassForm; 
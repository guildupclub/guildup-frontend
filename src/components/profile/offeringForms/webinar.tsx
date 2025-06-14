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

const INITIAL_FORM_STATE = {
    title: "",
    description: "",
    type: "consultation",
    price: {
      amount: 0,
      currency: "INR",
    },
    discounted_price: 0,
    duration: 60,
    is_free : true,
    tags: "",
    start_time: "",
    link: "",
};

interface OfferingFormProps {
    formData: typeof INITIAL_FORM_STATE;
    setFormData: React.Dispatch<React.SetStateAction<typeof INITIAL_FORM_STATE>>;
    handleOfferingSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    offeringCreated: boolean;
}


const WebinarForm = ({
    formData,
    setFormData,
    handleOfferingSubmit,
    loading,
    offeringCreated,
  }: OfferingFormProps) => {
    return (
        <form onSubmit={handleOfferingSubmit} className="space-y-4">
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
            placeholder="Discovery Call"
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
            placeholder="In this offering we will discuss about...."
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

        <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="price">
            {StringConstants.PRICE} ({StringConstants.INR})
            <span className="text-red-500">*</span>
            </Label>
            <Input
            id="price"
            type="number"
            value={formData.price.amount}
            onChange={(e) => {
                const value = e.target.value;
                setFormData({
                ...formData,
                price: {
                    ...formData.price,
                    amount: Number(value),
                },
                is_free: Number(value) === 0,
                });
            }}
            required
            />
        </div>

        <div className="space-y-2">
            <Label htmlFor="discounted_price">
            {StringConstants.DISCOUNTED_PRICE} (
            {StringConstants.INR})
            <span className="text-red-500">*</span>
            </Label>
            <Input
            id="discounted_price"
            type="number"
            value={
                formData.discounted_price
            }
            onChange={(e) => {
                const value = e.target.value;
                setFormData({
                ...formData,
                discounted_price: Number(value),
                is_free: Number(value) === 0,
                });
            }}
            required
            />
        </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="duration">
            {StringConstants.DURATION} (Mins)
            <span className="text-red-500">*</span>
            </Label>
            <Input
            id="duration"
            type="number"
            value={formData.duration}
            onChange={(e) =>
                setFormData({
                ...formData,
                duration: Number(e.target.value),
                })
            }
            required
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="start_time">
            Start Time<span className="text-red-500">*</span>
            </Label>
            <Input
            id="start_time"
            type="datetime-local"
            value={formData.start_time}
            onChange={(e) =>
                setFormData({ ...formData, start_time: e.target.value })
            }
            required
            />
        </div>
        </div>

        <div className="space-y-2">
            <Label htmlFor="link">
            Link<span className="text-red-500">*</span>
            </Label>
            <Input
            id="link"
            type="url"
            placeholder="https://zoom.us/..."
            value={formData.link}
            onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
            }
            />
        </div>

        <div className="flex justify-end pt-4">
        <Button
            type="submit"
            className="bg-primary text-white"
            disabled={loading || offeringCreated}
        >
            {loading
            ? "Creating..."
            : offeringCreated
            ? "Created!"
            : "Create offerings"}
        </Button>
        </div>
    </form>
    );
  };

export default WebinarForm;
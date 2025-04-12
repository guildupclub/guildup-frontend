import { useState } from "react";
import { IoVideocam } from "react-icons/io5";
import { Edit, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signIn, useSession } from "next-auth/react";
import { StringConstants } from "../common/CommonText";
import { AddOfferingDialog } from "./AddOfferingdialog";
import { BookingDialog } from "../booking/Bookingdialog";
import { Offering } from "./types/Offering";

interface CreateOfferingProps {
    isOwner: boolean;
    offerings: Offering[];
    fetchOfferings: () => void;
    handleEditClick: (offering: Offering) => void;
    handleDeleteOffering: (id: string) => void;
}


export const CreateOffering = ({
    isOwner,
    offerings,
    fetchOfferings,
    handleEditClick,
    handleDeleteOffering,
}: CreateOfferingProps) => {
    const { data: session } = useSession();
    const [selectedOffering, setSelectedOffering] = useState<Offering | null>(null);

    return (
        <div className="space-y-12">
            <div>
                <div className="flex items-center justify-between mb-6"></div>
                <div className="rounded-xl transition-all duration-300 border border-border/5">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-foreground">
                            {StringConstants.OFFERINGS}
                        </h2>
                        { <AddOfferingDialog onOfferingAdded={fetchOfferings} />}
                    </div>

                    {offerings.length === 0 ? (
                        <div className="text-center py-16 bg-card rounded-xl border border-border/5">
                            <p className="text-lg text-muted-foreground">
                                {StringConstants.NO_OFFERINGS}
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {offerings.map((offering) => (
                                <div
                                    key={offering._id || Math.random()}
                                    className="group bg-white rounded-lg p-6 hover:shadow-sm transition-all duration-300"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <IoVideocam className="text-primary h-6 w-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                                                {offering.title}
                                            </h3>
                                            <p className="text-sm text-muted-foreground mt-1 max-w-xl whitespace-pre-line">
                                                {offering.description}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-4 px-2">
                                        <div className="flex items-center flex-col justify-between gap-2">
                                            {isOwner && (
                                                <div className={`flex gap-2 ${isOwner ? "ml-auto" : ""}`}>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="px-3 py-2 rounded-lg flex items-center gap-1"
                                                        onClick={() => handleEditClick(offering)}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                        <span>{StringConstants.EDIT}</span>
                                                    </Button>

                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="px-3 py-2 rounded-lg flex items-center gap-1 text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                                                        onClick={() => handleDeleteOffering(offering._id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                        <span>{StringConstants.DELETE}</span>
                                                    </Button>
                                                </div>
                                            )}

                                            {!isOwner && (
                                                <Button
                                                    size="sm"
                                                    className={`text-white px-6 py-2 rounded-lg flex items-center gap-2 ${!isOwner ? "ml-auto" : ""
                                                        }`}
                                                    onClick={() => {
                                                        if (!session) {
                                                            signIn("google");
                                                            return;
                                                        }
                                                        setSelectedOffering(offering);
                                                    }}
                                                >
                                                    {offering.is_free ? (
                                                        <span>Free</span>
                                                    ) : offering?.discounted_price &&
                                                        offering?.price?.amount ? (
                                                        <>
                                                            <span className="line-through text-xs opacity-60">
                                                                ₹{offering.price.amount}
                                                            </span>
                                                            <span> ₹{offering.discounted_price}</span>
                                                        </>
                                                    ) : offering?.price?.amount ? (
                                                        <span>₹{offering.price.amount}</span>
                                                    ) : null}
                                                    <ArrowRight className="w-4 h-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {selectedOffering && (
                                <BookingDialog
                                    offering={{
                                        ...selectedOffering,
                                        price: selectedOffering.price || { amount: 0, currency: 'INR' },
                                        discounted_price: selectedOffering.discounted_price
                                            ? Number(selectedOffering.discounted_price)
                                            : 0,
                                    }}
                                    isOpen={!!selectedOffering}
                                    onClose={() => setSelectedOffering(null)}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
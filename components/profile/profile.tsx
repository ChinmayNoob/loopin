"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { updateUser } from "@/lib/actions/users";
import { toast } from "sonner";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { ProfileSchema } from "@/lib/schema-types";
import { Check, Loader } from "lucide-react";

interface ProfileProps {
    clerkId: string;
    user: string;
}

const Profile = ({ clerkId, user }: ProfileProps) => {
    const userInfo = JSON.parse(user);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    // 1. Defining form.
    const form = useForm<z.infer<typeof ProfileSchema>>({
        resolver: zodResolver(ProfileSchema),
        defaultValues: {
            name: userInfo.user?.name || "",
            username: userInfo.user?.username || "",
            leetcodeProfile: userInfo.user?.leetcodeProfile || "",
            location: userInfo.user?.location || "",
            bio: userInfo.user?.bio || "",
        },
    });

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof ProfileSchema>) {
        setIsSubmitting(true);
        try {
            await updateUser({
                clerkId,
                updateData: {
                    name: values.name,
                    username: values.username,
                    leetcodeProfile: values.leetcodeProfile || undefined,
                    location: values.location,
                    bio: values.bio,
                },
                path: pathname,
            });

            // back to profile pages
            router.back();

            toast.success("Profile updated", {
                icon: <Check className="text-green-500" />,
            });
        } catch (error) {
            console.log(error);
            toast.error("Failed to update profile");
        } finally {
            setIsSubmitting(false);
        }
    }
    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-9 flex w-full flex-col gap-3"
            >
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="space-y-3.5">
                            <FormLabel className="font-semibold">
                                Name <span className="text-red-600">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Enter Name"
                                    className="font-normal min-h-[56px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                        <FormItem className="space-y-3.5">
                            <FormLabel className="font-semibold">
                                username <span className="text-red-600">*</span>
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Your Usename"
                                    className="font-normal min-h-[56px]"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="leetcodeProfile"
                    render={({ field }) => (
                        <FormItem className="space-y-3.5">
                            <FormLabel className="font-semibold">
                                Leetcode Profile
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="url"
                                    placeholder="Your Leetcode Profile"
                                    className="font-normal min-h-[56px]"
                                    {...field}
                                    value={field.value || ""} // Convert null/undefined to empty string
                                />
                            </FormControl>
                            <FormMessage className="text-red-500" />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem className="space-y-3.5">
                            <FormLabel className="font-semibold">
                                Location
                            </FormLabel>
                            <FormControl>
                                <Input
                                    placeholder="Where are you from?"
                                    className="font-normal min-h-[56px]"
                                    {...field}
                                />
                            </FormControl>

                            <FormMessage className="text-red-500" />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem className="space-y-3.5">
                            <FormLabel className="font-semibold">
                                Bio
                            </FormLabel>
                            <FormControl>
                                <Textarea
                                    placeholder="What's special about you?"
                                        className="font-normal min-h-[56px]"
                                    {...field}
                                />
                            </FormControl>

                            <FormMessage className="text-red-500" />
                        </FormItem>
                    )}
                />
                <div className="mt-7 flex justify-end">
                    <Button
                        disabled={isSubmitting}
                        type="submit"
                        className=" w-fit"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader className="my-2 size-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};
export default Profile;

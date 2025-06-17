"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import React, { useRef, useState, useEffect } from "react";
import { Editor } from "@tinymce/tinymce-react";
import { Badge } from "../ui/badge";
import Image from "next/image";
import { useEditQuestion } from "@/lib/axios/questions";
import { useCurrentUser } from "@/lib/axios/users";
import { usePathname, useRouter } from "next/navigation";
import { Loader } from "lucide-react";

const EditQuestionSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters").max(130),
    content: z.string().min(20, "Content must be at least 20 characters"),
    tags: z.array(z.string().min(1).max(15)).min(1).max(3),
});

interface Props {
    questionId: number;
    initialData: {
        title: string;
        content: string;
        tags: Array<{ id: number; name: string; description: string }>;
    };
}

const EditQuestion = ({ questionId, initialData }: Props) => {
    const editorRef = useRef(null);
    const [tagInputValue, setTagInputValue] = useState("");
    const [isEditorReady, setIsEditorReady] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const editQuestionMutation = useEditQuestion();
    const { data: currentUser } = useCurrentUser();

    const form = useForm<z.infer<typeof EditQuestionSchema>>({
        resolver: zodResolver(EditQuestionSchema),
        defaultValues: {
            title: initialData.title,
            content: initialData.content,
            tags: initialData.tags.map(tag => tag.name),
        },
    });

    async function onSubmit(values: z.infer<typeof EditQuestionSchema>) {
        if (!currentUser?.success || !currentUser.user) {
            console.error("User not authenticated");
            return;
        }

        try {
            const result = await editQuestionMutation.mutateAsync({
                questionId,
                title: values.title,
                content: values.content,
                tags: values.tags,
                userId: currentUser.user.id,
                path: pathname,
            });

            if (result.success) {
                router.push(`/question/${questionId}`);
            } else {
                console.error("Error editing question:", result.error);
            }
        } catch (error) {
            console.error("Error editing question:", error);
        }
    }

    const handleInputKeyDown = (
        e: React.KeyboardEvent<HTMLInputElement>,
        field: any
    ) => {
        if (e.key === "Enter" && field.name === "tags") {
            e.preventDefault();

            const tagValue = tagInputValue.trim();

            if (tagValue !== "") {
                if (tagValue.length > 15) {
                    return form.setError("tags", {
                        type: "required",
                        message: "Tag must be less than 15 characters",
                    });
                }

                // Ensure field.value is an array
                const currentTags = Array.isArray(field.value) ? field.value : [];

                if (!currentTags.includes(tagValue)) {
                    form.setValue("tags", [...currentTags, tagValue]);
                    setTagInputValue("");
                    form.clearErrors("tags");
                }
            } else {
                form.trigger();
            }
        }
    };

    const handleTagRemove = (tag: string, field: any) => {
        const newTags = field.value.filter((t: string) => t !== tag);
        form.setValue("tags", newTags);
    };

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex w-full flex-col gap-10"
            >
                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem className="flex w-full flex-col">
                            <FormLabel className="paragraph-semibold text-dark400_light800">
                                Question Title <span className="text-red-600">*</span>
                            </FormLabel>
                            <FormControl className="mt-3.5">
                                <Input
                                    className="no-focus paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 min-h-[56px] border"
                                    {...field}
                                />
                            </FormControl>
                            <FormDescription className="body-regular text-dark100_light900 mt-2.5">
                                Be specific and ask the question as if you&apos;re asking it to
                                another person
                            </FormDescription>
                            <FormMessage className="text-red-600" />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                        <FormItem className="flex w-full flex-col gap-3">
                            <FormLabel className="paragraph-semibold text-dark400_light800">
                                Detailed explanation of your problem{" "}
                                <span className="text-red-600">*</span>
                            </FormLabel>
                            <FormControl className="mt-3.5">
                                <Editor
                                    apiKey={process.env.NEXT_PUBLIC_TINY_EDITOR_API_KEY}
                                    onInit={(_evt, editor) => {
                                        // @ts-ignore
                                        editorRef.current = editor;
                                        setIsEditorReady(true);
                                    }}
                                    onBlur={field.onBlur}
                                    onEditorChange={(content) => {
                                        if (isEditorReady) {
                                            field.onChange(content);
                                        }
                                    }}
                                    initialValue={initialData.content}
                                    init={{
                                        height: 350,
                                        menubar: false,
                                        plugins: [
                                            "advlist",
                                            "autolink",
                                            "lists",
                                            "link",
                                            "image",
                                            "charmap",
                                            "preview",
                                            "anchor",
                                            "searchreplace",
                                            "visualblocks",
                                            "codesample",
                                            "fullscreen",
                                            "insertdatetime",
                                            "media",
                                            "table",
                                            "code",
                                        ],
                                        toolbar:
                                            "undo redo | blocks | " +
                                            "codesample | bold italic forecolor | alignleft aligncenter " +
                                            "alignright alignjustify | bullist numlist | ",
                                        content_style: "body { font-family:Inter; font-size:16px }",
                                        skin: "oxide",
                                        content_css: "light",
                                    }}
                                />
                            </FormControl>
                            <FormDescription className="body-regular text-dark400_light800 mt-2.5">
                                Include as many details as possible. The more you tell us, the
                                easier it will be for others to help you.
                            </FormDescription>
                            <FormMessage className="text-red-500" />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                        <FormItem className="flex w-full flex-col">
                            <FormLabel className="paragraph-semibold text-dark400_light800">
                                Tags <span className="text-red-600">*</span>
                            </FormLabel>
                            <FormControl className="mt-3.5">
                                <div>
                                    <Input
                                        placeholder="Add tags..."
                                        className="no-focus paragraph-regular background-light900_dark300 light-border-2 text-dark300_light700 min-h-[56px] border"
                                        onKeyDown={(e) => handleInputKeyDown(e, field)}
                                        value={tagInputValue}
                                        onChange={(e) => setTagInputValue(e.target.value)}
                                    />
                                    {field.value && field.value.length > 0 && (
                                        <div className="flex-start mt-2.5 gap-2.5">
                                            {field.value.map((tag: any) => (
                                                <Badge
                                                    key={tag}
                                                    className="subtle-medium primary-gradient text-light400_light500 text-light900_dark100 flex items-center justify-center gap-2 rounded-md border-none p-2 capitalize"
                                                    onClick={() => handleTagRemove(tag, field)}
                                                >
                                                    {tag}
                                                    <Image
                                                        src="/assets/icons/close.svg"
                                                        alt="close"
                                                        className="cursor-pointer object-contain invert dark:invert-0"
                                                        width={12}
                                                        height={12}
                                                    />
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </FormControl>
                            <FormDescription className="body-regular text-dark100_light900 mt-2.5">
                                Add up to 3 tags to help others find your question. Press Enter after typing each tag.
                            </FormDescription>
                            <FormMessage className="text-red-500" />
                        </FormItem>
                    )}
                />
                <div className="flex gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="border-[#cbcbcb] dark:border-[#212734] text-[#000000] dark:text-[#FFFFFF] hover:bg-[#F4F6F8] dark:hover:bg-[#151821]"
                        onClick={() => router.push(`/question/${questionId}`)}
                        disabled={editQuestionMutation.isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        className="primary-gradient text-light900_dark100 w-fit"
                        disabled={editQuestionMutation.isPending}
                    >
                        {editQuestionMutation.isPending ? (
                            <>
                                <Loader className="text-light900_dark100 my-2 size-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            "Update question"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
};

export default EditQuestion; 
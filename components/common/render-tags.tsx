import Link from "next/link";
import React from "react";
import { Badge } from "@/components/ui/badge";

interface Props {
    _id: string;
    name: string;
    totalQuestions?: number;
    showCount?: boolean;
    classname?: string;
}

const RenderTag = ({ _id, name, totalQuestions, showCount, classname }: Props) => {
    return (
        <Link href={`/tag/${_id}`} className="flex justify-between gap-2">
            <Badge className={` text-white dark:text-white text-nowrap rounded-md bg-black p-2 text-xs uppercase ${classname}`}>
                {name}
            </Badge>

            {showCount && (
                <p className="text-sm">{totalQuestions}</p>
            )}
        </Link>
    );
};

export default RenderTag;

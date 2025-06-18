"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

import {
    Menubar,
    MenubarContent,
    MenubarItem,
    MenubarMenu,
    MenubarTrigger,
} from "@/components/ui/menubar";
import { themes } from "@/constants";
import { useTheme } from "@/lib/context/provider";

const Theme = () => {
    const [mounted, setMounted] = useState(false);
    const { mode, setMode } = useTheme();

    // Prevent hydration mismatch by only rendering after component mounts
    useEffect(() => {
        setMounted(true);
    }, []);

    // Return a skeleton version before mounting to prevent hydration mismatch
    if (!mounted) {
        return (
            <div className="size-9 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        );
    }

    return (
        <Menubar className="relative border-none bg-transparent shadow-none">
            <MenubarMenu>
                <MenubarTrigger className="flex size-9 cursor-pointer items-center justify-center rounded-full focus:bg-neutral-100 data-[state=open]:bg-neutral-300 dark:focus:bg-zinc-800 dark:data-[state=open]:bg-zinc-800">
                    {mode === "light" ? (
                        <Image
                            src="/assets/icons/sun.svg"
                            width={20}
                            height={20}
                            alt="sun"
                            className="active:scale-95"
                        />
                    ) : (
                        <Image
                            src="/assets/icons/moon.svg"
                            width={20}
                            height={20}
                            alt="moon"
                            className="active:scale-95 dark:invert"
                        />
                    )}
                </MenubarTrigger>
                <MenubarContent className="absolute -right-12 mt-3 min-w-[150px] rounded-md border bg-white py-2 shadow-md dark:border-zinc-800 dark:bg-zinc-900">
                    {themes.map((item) => (
                        <MenubarItem
                            key={item.value}
                            onClick={() => {
                                setMode(item.value);

                                if (item.value !== "system") {
                                    localStorage.theme = item.value;
                                } else {
                                    localStorage.removeItem("theme");
                                }
                            }}
                            className="flex cursor-pointer items-center gap-4 px-2.5 py-2 focus:bg-neutral-100 dark:focus:bg-zinc-800"
                        >
                            <Image
                                src={item.icon}
                                width={12}
                                height={12}
                                alt={item.value}
                                className="dark:invert"
                            />
                            <p className="font-medium text-neutral-700 dark:text-neutral-300">
                                {item.label}
                            </p>
                        </MenubarItem>
                    ))}
                </MenubarContent>
            </MenubarMenu>
        </Menubar>
    );
};

export default Theme;

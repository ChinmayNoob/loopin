import { SignedIn, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/actions/users";
import Theme from "./theme-toggle";
import MobileNav from "./mobile-navbar";

const Navbar = async () => {
    const { userId } = await auth();

    // Dummy data for tags
    const allTags = {
        tags: [
            { id: 1, name: "JavaScript" },
            { id: 2, name: "React" },
            { id: 3, name: "TypeScript" },
            { id: 4, name: "Node.js" },
            { id: 5, name: "Next.js" }
        ]
    };

    const result = await getUserByClerkId(userId || "");
    const user = {
        name: result?.success && result.user ? result.user.name : "",
        username: result?.success && result.user ? result.user.username : "",
        picture: result?.success && result.user ? result.user.picture : "",
    };

    return (
        <nav className="flex items-center justify-between fixed left-1/2 top-2 z-50 w-[95%] max-w-6xl -translate-x-1/2 gap-5 rounded-xl bg-zinc-300/40 px-4 py-2 shadow-light-300 backdrop-blur-md backdrop-saturate-150 dark:bg-dark-4/70 dark:shadow-none max-sm:w-[98%] max-sm:gap-1 sm:px-7">
            {/* Logo Section */}
            <Link href="/" className="flex items-center gap-1 min-w-11 sm:min-w-32">
                <Image
                    src="/assets/logo.svg"
                    width={28}
                    height={28}
                    alt="Tuff"
                    className="size-9 invert-0 dark:invert"
                />
                <p className="font-spaceGrotesk font-bold text-2xl max-sm:hidden">
                    Tuff
                </p>
            </Link>

            {/* Center Section - Mobile Only */}
            <div className="flex items-center justify-center gap-3 sm:hidden">
                <Theme />
                <MobileNav user={user} popularTags={JSON.stringify(allTags?.tags)} />
            </div>

            {/* Right Section - Desktop */}
            <div className="flex items-center gap-3 max-sm:hidden">
                <Theme />
                <SignedIn>
                    <UserButton
                        appearance={{
                            elements: {
                                avatarBox: "size-9",
                            },
                            variables: {
                                colorPrimary: "#ff7000",
                            },
                        }}
                    />
                </SignedIn>
            </div>
        </nav>
    );
};

export default Navbar;

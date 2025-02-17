"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { sidebarLinks } from "@/constants";
import { SignedIn, SignedOut, SignOutButton, useAuth, useClerk } from "@clerk/nextjs";

function Bottombar() {
  const pathname = usePathname();
  const router = useRouter();
  const { userId } = useAuth();
  const { signOut } = useClerk();

  const handleNavigation = (route: string) => {
    if (route === '/profile') {
      router.push(`/profile/${userId}`);
    } else {
      router.push(route);
    }
  };

  return (
    <section className="bottombar">
      <div className="bottombar_container">
        <SignedIn>
          {sidebarLinks.map((link) => {
            const isActive =
              (pathname && pathname.includes(link.route) && link.route.length > 1) ||
              pathname === link.route;

            return (
              <div
                key={link.label}
                className={`bottombar_link ${isActive ? "bg-primary-500" : ""}`}
                onClick={() => handleNavigation(link.route)}
              >
                <Image
                  src={link.imgURL}
                  alt={link.label}
                  width={24}
                  height={24}
                />
                <p className="text-subtle-medium text-light-1">
                  {link.label.split(/\s+/)[0]}
                </p>
              </div>
            );
          })}

          <SignOutButton>
            <div
              className="bottombar_link"
              onClick={() => {
                signOut().then(() => router.push("/sign-in"));
              }}
            >
              <Image
                src="/assets/logout.svg"
                alt="logout"
                width={24}
                height={24}
              />
              <p className="text-subtle-medium text-light-1">
                Logout
              </p>
            </div>
          </SignOutButton>
        </SignedIn>

        <SignedOut>
          <div
            className="bottombar_link"
            onClick={() => router.push("/sign-in")}
          >
            <Image
              src="/assets/login.svg"
              alt="login"
              width={24}
              height={24}
            />
            <p className="text-subtle-medium text-light-1">
              Login
            </p>
          </div>
        </SignedOut>
      </div>
    </section>
  );
}

export default Bottombar;

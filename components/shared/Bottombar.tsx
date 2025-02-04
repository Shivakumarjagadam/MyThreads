// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { sidebarLinks } from "@/constants";
// import { useRouter, usePathname } from "next/navigation";
// import { SignedIn, SignOutButton, useClerk } from "@clerk/nextjs";

// function Bottombar() {
//   const router = useRouter();
//   const pathname = usePathname();

//   return (
//     <section className="bottombar"> 
//       <div className="bottombar_container">
//         {sidebarLinks.map((link) => {
//           const isActive = ((pathname ?? "").includes(link.route) && link.route.length > 1) ||
//             pathname === link.route;

//           return (
//             <Link
//               href={link.route}
//               key={link.label}
//               className={`bottombar_link  ${isActive ? "bg-primary-500" : ""} `}
//             >
//               <Image src={link.imgURL} alt={link.label} width={24} height={24} />
//               {/* split(/\s+/)[0] -> is to take only 1st word... */}
//               <p className="text-subtle-medium text-light-1  max-sm:hidden">{link.label.split(/\s+/)[0]}</p> 
//             </Link>
//           );
//         })}
//       </div>

     
//     </section>
//   );
// }

// export default Bottombar;




"use client";

import Image from "next/image";
import { sidebarLinks } from "@/constants";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@clerk/nextjs";

function Bottombar() {
  const router = useRouter();
  const pathname = usePathname();
  const { userId } = useAuth(); // Get the logged-in user ID

  // Handle navigation with profile ID
  const handleNavigation = (route: string) => {
    if (route === "/profile" && userId) {
      router.push(`/profile/${userId}`); // Redirect to correct profile page
    } else {
      router.push(route);
    }
  };

  return (
    <section className="bottombar">
      <div className="bottombar_container">
        {sidebarLinks.map((link) => {
          const isActive =
            ((pathname ?? "").includes(link.route) && link.route.length > 1) ||
            pathname === link.route;

          return (
            <button
              key={link.label}
              onClick={() => handleNavigation(link.route)}
              className={`bottombar_link ${isActive ? "bg-primary-500" : ""}`}
            >
              <Image src={link.imgURL} alt={link.label} width={24} height={24} />
              <p className="text-subtle-medium text-light-1 max-sm:hidden">
                {link.label.split(/\s+/)[0]}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default Bottombar;

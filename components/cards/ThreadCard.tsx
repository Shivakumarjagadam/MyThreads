
// import Link from "next/link";
// import Image from "next/image";

// interface Props {
//   id: string;
//   currentUserId: string;
//   parentId: string;
//   content: string;
//   author: {
//     name: string;
//     image: string;
//     id: string;
//   };
//   community: {
//     id: string;
//     name: string;
//     image: string;
//   } | null;
//   createdAt: string;
//   comments: {
//     author: {
//       image: string;
//     };
//   }[];
//   isComment?: boolean;
// }

// const ThreadCard = ({
//   id,
//   currentUserId,
//   parentId,
//   content,
//   author,
//   community,
//   createdAt,
//   comments,
//   isComment,
// }: Props) => {
//   return (
//     <article
//       className={`mt-3 flex flex-col w-full rounded-lg ${
//         isComment ? "bg-transparent p-4" : "bg-dark-2 p-7 gap-4"
//       }`}
//     >
//       <div className="flex items-start justify-between">
//         <div className="flex flex-1 flex-row w-full gap-4">
//           <div className="flex flex-col items-center">
//             <Link href={`/profile/${author.id}`} className="relative h-11 w-11">
//               <Image
//                 src={author.image}
//                 alt="Profile Image"
//                 fill
//                 className="cursor-pointer rounded-full"
//               />
//             </Link>

//             {!isComment && <div className="thread-card_bar" />}
//           </div>

//           <div className="flex flex-col w-full">
//             <Link href={`/profile/${author.id}`} className="w-fit">
//               <h4 className="cursor-pointer text-base-semibold text-light-1">
//                 {author.name}
//               </h4>
//             </Link>

//             <p className="mt-2 text-base-regular text-light-2">{content}</p>

//             <div className={`${isComment ? "mb-4" : "mt-5"} flex flex-col gap-3`}>
//               <div className="flex gap-3.5">
//                 <Image
//                   src="/assets/heart-gray.svg"
//                   alt="heart"
//                   height={24}
//                   width={24}
//                   className="cursor-pointer object-contain"
//                 />

//                 <Link href={`/thread/${id}`}>
//                   <Image
//                     src="/assets/reply.svg"
//                     alt="reply"
//                     height={24}
//                     width={24}
//                     className="cursor-pointer object-contain"
//                   />
//                 </Link>

//                 <Image
//                   src="/assets/repost.svg"
//                   alt="repost"
//                   height={24}
//                   width={24}
//                   className="cursor-pointer object-contain"
//                 />

//                 <Image
//                   src="/assets/share.svg"
//                   alt="share"
//                   height={24}
//                   width={24}
//                   className="cursor-pointer object-contain"
//                 />
//               </div>

//               {isComment && comments.length > 0 && (
//                 <Link href={`/thread/${id}`}>
//                   <p className="mt-1 text-subtle-medium text-gray-1">
//                     {comments.length} replies
//                   </p>
//                 </Link>
//               )}
//             </div>
//           </div>
//         </div>
//         {/* add time and date when created? */}
//       </div>
//     </article>
//   );
// };

// export default ThreadCard;







//update date & time:
import Link from "next/link";
import Image from "next/image";

interface Props {
  id: string;
  currentUserId: string;
  parentId: string;
  content: string;
  author: {
    name: string;
    image: string;
    id: string;
  };
  community: {
    id: string;
    name: string;
    image: string;
  } | null;
  createdAt: string; // Date stored in your database
  comments: {
    author: {
      image: string;
    };
  }[];
  isComment?: boolean;
}

const ThreadCard = ({
  id,
  currentUserId,
  parentId,
  content,
  author,
  community,
  createdAt,
  comments,
  isComment,
}: Props) => {
  // Format the createdAt timestamp
  const formattedDate = new Date(createdAt).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <article
      className={`mt-3 flex flex-col w-full rounded-lg ${
        isComment ? "bg-transparent p-4" : "bg-dark-2 p-7 gap-4"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-1 flex-row w-full gap-4">
          <div className="flex flex-col items-center">
            <Link href={`/profile/${author.id}`} className="relative h-11 w-11">
              <Image
                src={author.image}
                alt="Profile Image"
                fill
                className="cursor-pointer rounded-full"
              />
            </Link>

            {!isComment && <div className="thread-card_bar" />}
          </div>

          <div className="flex flex-col w-full">
            {/* Profile Name & Created Date */}
            <div className="flex justify-between items-center">
              <Link href={`/profile/${author.id}`} className="w-fit">
                <h4 className="cursor-pointer text-base-semibold text-light-1">
                  {author.name}
                </h4>
              </Link>
              <p className="text-sm text-gray-400">{formattedDate}</p>
            </div>

            <p className="mt-2 text-base-regular text-light-2">{content}</p>

            <div className={`${isComment ? "mb-4" : "mt-5"} flex flex-col gap-3`}>
              <div className="flex gap-3.5">
                <Image
                  src="/assets/heart-gray.svg"
                  alt="heart"
                  height={24}
                  width={24}
                  className="cursor-pointer object-contain"
                />

                <Link href={`/thread/${id}`}>
                  <Image
                    src="/assets/reply.svg"
                    alt="reply"
                    height={24}
                    width={24}
                    className="cursor-pointer object-contain"
                  />
                </Link>

                <Image
                  src="/assets/repost.svg"
                  alt="repost"
                  height={24}
                  width={24}
                  className="cursor-pointer object-contain"
                />

                <Image
                  src="/assets/share.svg"
                  alt="share"
                  height={24}
                  width={24}
                  className="cursor-pointer object-contain"
                />
              </div>

              {isComment && comments.length > 0 && (
                <Link href={`/thread/${id}`}>
                  <p className="mt-1 text-subtle-medium text-gray-1">
                    {comments.length} replies
                  </p>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ThreadCard;




//toggle:
// "use client";
// import Link from "next/link";
// import Image from "next/image";
// import { useState } from "react";

// interface Props {
//   id: string;
//   currentUserId: string;
//   parentId: string;
//   content: string;
//   author: {
//     name: string;
//     image: string;
//     id: string;
//   };
//   community: {
//     id: string;
//     name: string;
//     image: string;
//   } | null;
//   createdAt: string; // Date stored in your database
//   comments: {
//     author: {
//       image: string;
//     };
//   }[];
//   isComment?: boolean;
// }

// const ThreadCard = ({
//   id,
//   currentUserId,
//   parentId,
//   content,
//   author,
//   community,
//   createdAt,
//   comments,
//   isComment,
// }: Props) => {
//   // State to track like status
//   const [isLiked, setIsLiked] = useState(false);

//   // Function to toggle like/dislike
//   const handleLikeToggle = () => {
//     setIsLiked(!isLiked);
//   };

//   // Format the createdAt timestamp
//   const formattedDate = new Date(createdAt).toLocaleString("en-US", {
//     month: "short",
//     day: "numeric",
//     year: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//   });

//   return (
//     <article
//       className={`mt-3 flex flex-col w-full rounded-lg ${
//         isComment ? "bg-transparent p-4" : "bg-dark-2 p-7 gap-4"
//       }`}
//     >
//       <div className="flex items-start justify-between">
//         <div className="flex flex-1 flex-row w-full gap-4">
//           <div className="flex flex-col items-center">
//             <Link href={`/profile/${author.id}`} className="relative h-11 w-11">
//               <Image
//                 src={author.image}
//                 alt="Profile Image"
//                 fill
//                 className="cursor-pointer rounded-full"
//               />
//             </Link>

//             {!isComment && <div className="thread-card_bar" />}
//           </div>

//           <div className="flex flex-col w-full">
//             {/* Profile Name & Created Date */}
//             <div className="flex justify-between items-center">
//               <Link href={`/profile/${author.id}`} className="w-fit">
//                 <h4 className="cursor-pointer text-base-semibold text-light-1">
//                   {author.name}
//                 </h4>
//               </Link>
//               <p className="text-sm text-gray-400">{formattedDate}</p>
//             </div>

//             <p className="mt-2 text-base-regular text-light-2">{content}</p>

//             <div className={`${isComment ? "mb-4" : "mt-5"} flex flex-col gap-3`}>
//               <div className="flex gap-3.5">
//                 {/* Like Button */}
//                 <div
//                   onClick={handleLikeToggle}
//                   className={`cursor-pointer ${isLiked ? "text-red-500" : "text-white"}`}
//                 >
//                   <Image
//                     src={isLiked ? "/assets/heart-red.svg" : "/assets/heart-gray.svg"}
//                     alt="heart"
//                     height={24}
//                     width={24}
//                     className="object-contain"
//                   />
//                 </div>

//                 <Link href={`/thread/${id}`}>
//                   <Image
//                     src="/assets/reply.svg"
//                     alt="reply"
//                     height={24}
//                     width={24}
//                     className="cursor-pointer object-contain"
//                   />
//                 </Link>

//                 <Image
//                   src="/assets/repost.svg"
//                   alt="repost"
//                   height={24}
//                   width={24}
//                   className="cursor-pointer object-contain"
//                 />

//                 <Image
//                   src="/assets/share.svg"
//                   alt="share"
//                   height={24}
//                   width={24}
//                   className="cursor-pointer object-contain"
//                 />
//               </div>

//               {isComment && comments.length > 0 && (
//                 <Link href={`/thread/${id}`}>
//                   <p className="mt-1 text-subtle-medium text-gray-1">
//                     {comments.length} replies
//                   </p>
//                 </Link>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </article>
//   );
// };

// export default ThreadCard;





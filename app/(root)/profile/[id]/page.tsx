import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { fetchUser } from "@/lib/actions/user.actions";
import ProfileHeader from "@/components/shared/ProfileHeader";
import { Tabs,TabsContent,TabsList,TabsTrigger } from "@/components/ui/tabs";
import { profileTabs } from "@/constants";
import Image from "next/image";
import ThreadsTab from "@/components/shared/ThreadsTab";

async function Page({params}:{params:{id:string}}) {
  const user = await currentUser();

  if (!user) return <h1 className="head-text">no user</h1>;  

  // fetch organization list created by user
  const userInfo = await fetchUser(params.id);
  if (!userInfo?.onboarded) redirect("/onboarding");
  return(
    <section>
      <h2>profile</h2>
      <ProfileHeader
      accountId={userInfo.id}
      authUserId={user.id}
      name={userInfo.name}
      username={userInfo.username}
      imageUrl={userInfo.image}
      bio={userInfo.bio}
      />

      <div className="mt-9">
         <Tabs defaultValue="threads" className="w-full">
            <TabsList className="tab">
                {profileTabs.map((tab) =>(
                    <TabsTrigger value={tab.value} key={tab.label}>
                        <Image
                        src={tab.icon}
                        alt={tab.label}
                        width={24}
                        height={24}
                        className="object-contain"
                        />
                       <p className="max-sm:hidden"> {tab.label}</p>

                       {tab.label==="Threads" && (
                        <p className="ml-2 rounded-sm bg-light-4 !text-tiny-medium text-light-2 px-2 py-1">{userInfo?.threads?.length}</p>
                       )}
                    </TabsTrigger>
                ))}
            </TabsList>

            {profileTabs.map((tab)=>(
              <TabsContent value={tab.value} key={`content-${tab.label}`}  className="w-full text-light-1">
                <ThreadsTab
                currentUserId={user.id}
                accountId={userInfo.id}
                accountType="User"

                />

              </TabsContent>
            ))}
         </Tabs>
      </div>
    </section>
  )
  
}

export default Page;



"use client"

import {useForm } from "react-hook-form";
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
import {Button} from "@/components/ui/button";
import {zodResolver} from "@hookform/resolvers/zod";
import { UserValidation } from "@/lib/validations/user";
import { z } from "zod";
import Image from "next/image";
import { ChangeEvent, useState } from "react";
import { Textarea }  from "@/components/ui/textarea";
import { isBase64Image } from "@/lib/utils";  //created by chatgpt
import { useUploadThing } from "@/lib/uploadthing";
import { updateUser } from "@/lib/actions/user.actions";
import {usePathname,useRouter} from "next/navigation";


interface Props{
  user:{
    id:string;
    objectId:string;
    username:string;
    name:string;
    bio:string;
    image:string;

  };
  btnTitle:string; //"Edit Profile" or "Follow" or "Unfollow" etc.
}
const AccountProfile=({user,btnTitle}:Props)=>{
   const [files, setFiles] = useState<File[]>([]);
   const {startUpload}= useUploadThing("media");

   const router = useRouter();
  const pathname = usePathname();

  const form = useForm({
    resolver:zodResolver(UserValidation),
    defaultValues:{
      profile_photo:user?.image || "",
      name:user?.name || "",
       username:user?.username || "",
      bio:user?.bio || "",
     
    }

  })

  //handle images used to upload the image when user is logged in with via email address...
  const handleImage=(e:ChangeEvent<HTMLInputElement>,fieldChange:(value :string)=>void) =>{
    e.preventDefault();

    const filereader = new FileReader();

    if(e.target.files && e.target.files.length>=1){
      const file = e.target.files[0];
      setFiles(Array.from(e.target.files)); //setFiles about useState

      if(!file.type.includes("image")) return ;

      filereader.onload=async (event) =>{
        const imageDataUrl = event.target?.result?.toString() || "";
        fieldChange(imageDataUrl);
      }

      filereader.readAsDataURL(file);
    }

  }

  const onSubmit  = async(values: z.infer<typeof UserValidation>) => {
    const blob = values.profile_photo;
    const hasImageChanged = isBase64Image(blob);

    if(hasImageChanged) {
      const imgRes = await startUpload(files)

      if(imgRes && imgRes[0].url){
        values.profile_photo = imgRes[0].url;
      }
    }



    //here, we can write backend logic to update  user profile...
    await updateUser({
      userId: user.id,
      username:values.username,
      name: values.name,
      bio: values.bio,
      image: values.profile_photo,
      path: pathname
    
    }
  );
  
  if(pathname==='/profile/edit'){
    router.back();
  }
  else{
    router.push('/');
  }

  }

  
  return(
    <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} 
    className="flex flex-col justify-start gap-10"
    >


      <FormField
        control={form.control}
       name="profile_photo"
        render={({ field }) => (
          <FormItem className="flex items-center gap-4">
            <FormLabel className="account-form_image-label">
              {
                field.value ?(
                  <Image
                 src={field.value}
                 alt="profile photo"
                 width={96}
                 height={96}
                 priority  //to load faster
                 className="rounded-full object-contain" 
                  />
                ):(
                  <Image
                  src="/assets/profile.svg"
                  alt="profile photo"
                  width={24}
                  height={24}
                
                  className="object-contain" 
                   />

                )
              }
            </FormLabel>
            <FormControl className="flex-1 text-base-semibold text-gray-200 " >
              <Input
              type="file"
              accept="image/*"
              placeholder="upload a image"
              className="account-form_image-input"
              onChange={(e)=>handleImage(e,field.onChange)}
              />
            </FormControl> 
            <FormMessage/>        
          </FormItem>
        )}
      />


<FormField
        control={form.control}
       name="name"  //this field is used to set the name
        render={({ field }) => (
          <FormItem className="flex flex-col gap-3 w-full">
            <FormLabel className="text-base-semibold text-light-2">
            Name
            </FormLabel>
            <FormControl  >
              <Input
              type="text"
              placeholder="your name"
              className="account-form_input  no-focus"
              {...field}
              />
            </FormControl>  
            <FormMessage/>       
          </FormItem>
        )}
      />


<FormField
        control={form.control}
       name="username"  //this field is used to set the name
        render={({ field }) => (
          <FormItem className="flex flex-col gap-3 w-full">
            <FormLabel className="text-base-semibold text-light-2">
            Username
            </FormLabel>
            <FormControl  >
              <Input
              type="text"
              placeholder="your name"
              className="account-form_input  no-focus"
              {...field}
              />
            </FormControl>  
            <FormMessage/>       
          </FormItem>
        )}
      />



<FormField
        control={form.control}
       name="bio"  //this field is used to set the bio
        render={({ field }) => (
          <FormItem className="flex flex-col gap-3 w-full">
            <FormLabel className="text-base-semibold text-light-2">
            Bio
            </FormLabel>
            <FormControl >
              <Textarea
             rows={10}             
              placeholder="your name"
              className="account-form_input  no-focus"
              {...field}
              />
            </FormControl>  
            <FormMessage/>       
          </FormItem>
        )}
      />



      <Button type="submit" className="bg-primary-500">Submit</Button>
    </form>
  </Form>
  )
}

export default AccountProfile;




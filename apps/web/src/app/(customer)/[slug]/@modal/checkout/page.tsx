// "use client";
// import {
//   Drawer,
//   DrawerClose,
//   DrawerContent,
//   DrawerTrigger,
// } from "@repo/ui/components/drawer";
// import { useRouter } from "next/navigation";

// const CheckoutPage = () => {
//   const router = useRouter();
//   return (
//     <Drawer
//       open={true}
//       onOpenChange={(open) => {
//         if (!open) {
//           router.back();
//         }
//       }}
//     >
//       <DrawerTrigger>
//         Checkout koo
//       </DrawerTrigger>
//       <DrawerContent>
//         <DrawerClose />
//         <div className="p-4">
//           <h2 className="text-lg font-semibold">Checkout</h2>
//           {/* Your checkout content goes here */}
//           <p>Checkout details will be displayed here abcdrh.</p>
//         </div>
//       </DrawerContent>
//     </Drawer>
//   );
// };

// export default CheckoutPage;


'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';

export default function ProjectModal() {
  const pathname = usePathname();
  const router = useRouter();
    const { slug } = useParams<{ slug: string }>();
  
  const isModal = pathname === `/${slug}` || pathname === `/${slug}/checkout` || pathname.startsWith(`/${slug}?`);
  console.log('Current pathname:', pathname);
  console.log('Is modal:', isModal);
  console.log('Slug:', slug);
  const content = (
    <div className="p-6 bg-white rounded-xl">
      <h1 className="text-2xl font-bold">Project ID:</h1>
      <p>This is the project detail.</p>
    </div>
  );

  if (isModal) {
    // Modal version
    return (
      <div
        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
        onClick={() => router.back()}
      >
        <div onClick={(e) => e.stopPropagation()}>
          {content}
        </div>
      </div>
    );
  }

  // Full-page fallback version
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      {content}
    </div>
  );
}

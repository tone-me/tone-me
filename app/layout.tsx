// import type { Metadata } from "next"
// import { Inter } from "next/font/google"
// import "./globals.css"
// import Navigation from "./components/Navbar";
// import "./globals.css";

// const inter = Inter({ subsets: ["latin"] });


// export const metadata: Metadata = {
//   title: "Create Next App",
//   description: "Generated by create next app",
// }

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode
// }) {
//   return (
//     <html lang="en">
//       <body className={inter.className}>
//         <Navigation />
//         {children}
//       </body>
//     </html>
//   )
// }

import "./css/style.css"

import { Inter } from "next/font/google"


const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
})

export const metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-inter antialiased bg-white text-gray-900 tracking-tight`}>
        <div className="flex flex-col min-h-screen overflow-hidden supports-[overflow:clip]:overflow-clip">
          {children}
        </div>
      </body>
    </html>
  )
}

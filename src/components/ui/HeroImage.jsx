"use client";
import { CldImage } from 'next-cloudinary';

export default function HeroImage({url}) {
    console.log("🚀 ~ HeroImage ~ url:", url)
    return (
        <CldImage
            src={url}
            alt="Hero Image"
            fill
            priority
            sizes="50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
    )
}

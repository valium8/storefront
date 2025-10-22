"use client";

import { useState, useEffect } from "react";
import { ProductImageWrapper } from "../atoms/ProductImageWrapper";
import { type VariantDetailsFragment } from "@/gql/graphql";

interface ProductImageGalleryProps {
	variants: readonly VariantDetailsFragment[];
	selectedVariant?: VariantDetailsFragment;
	productMedia?: Array<{ url: string; alt: string }> | null;
}

export function ProductImageGallery({ variants, selectedVariant, productMedia }: ProductImageGalleryProps) {
	const [selectedImageIndex, setSelectedImageIndex] = useState(0);

	// Get all unique images from variants and product media
	const allImages = new Map<string, { url: string; alt: string }>();

	// Add product media first
	productMedia?.forEach((media) => {
		if (media.url) {
			allImages.set(media.url, {
				url: media.url,
				alt: media.alt || "",
			});
		}
	});

	// Add variant media
	variants.forEach((variant) => {
		variant.media?.forEach((media) => {
			if (media.url) {
				allImages.set(media.url, {
					url: media.url,
					alt: media.alt || "",
				});
			}
		});
	});

	// Filter images by selected variant's color if available
	const getColorAttribute = (variant: VariantDetailsFragment) => {
		return variant.attributes?.find(
			(attr) =>
				attr.attribute.name?.toLowerCase().includes("color") ||
				attr.attribute.slug?.toLowerCase().includes("color"),
		);
	};

	const selectedColor = selectedVariant ? getColorAttribute(selectedVariant)?.values?.[0]?.name : null;

	// If we have a selected color, filter images to only show those from variants with the same color
	const filteredImages = selectedColor
		? Array.from(allImages.values()).filter((image) => {
				// Check if this image belongs to a variant with the selected color
				return variants.some((variant) => {
					const variantColor = getColorAttribute(variant)?.values?.[0]?.name;
					return variantColor === selectedColor && variant.media?.some((media) => media.url === image.url);
				});
			})
		: Array.from(allImages.values());

	// If no filtered images, show all images
	const displayImages = filteredImages.length > 0 ? filteredImages : Array.from(allImages.values());

	// Reset selected image when variant changes
	useEffect(() => {
		setSelectedImageIndex(0);
	}, [selectedVariant]);

	if (displayImages.length === 0) {
		return null;
	}

	const currentImage = displayImages[selectedImageIndex];

	return (
		<div className="space-y-4">
			{/* Main image */}
			<div className="aspect-square">
				<ProductImageWrapper
					priority={selectedImageIndex === 0}
					alt={currentImage.alt}
					width={1024}
					height={1024}
					src={currentImage.url}
				/>
			</div>

			{/* Thumbnail navigation */}
			{displayImages.length > 1 && (
				<div className="grid grid-cols-4 gap-2">
					{displayImages.map((image, index) => (
						<button
							key={`${image.url}-${index}`}
							type="button"
							onClick={() => setSelectedImageIndex(index)}
							className={`aspect-square overflow-hidden rounded border-2 transition-colors ${
								selectedImageIndex === index
									? "border-neutral-900"
									: "border-neutral-200 hover:border-neutral-400"
							}`}
							aria-label={`View image ${index + 1}`}
						>
							<img src={image.url} alt={image.alt} className="h-full w-full object-cover" loading="lazy" />
						</button>
					))}
				</div>
			)}
		</div>
	);
}

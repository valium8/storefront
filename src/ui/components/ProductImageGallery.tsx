import { ProductImageWrapper } from "../atoms/ProductImageWrapper";
import { type VariantDetailsFragment } from "@/gql/graphql";

interface ProductImageGalleryProps {
	variants: readonly VariantDetailsFragment[];
	selectedVariant?: VariantDetailsFragment;
	productMedia?: Array<{ url: string; alt: string }> | null;
}

export function ProductImageGallery({ variants, selectedVariant, productMedia }: ProductImageGalleryProps) {
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

	if (displayImages.length === 0) {
		return null;
	}

	return (
		<div className="space-y-4">
			{displayImages.map((image, index) => (
				<div key={`${image.url}-${index}`} className="aspect-square">
					<ProductImageWrapper
						priority={index === 0}
						alt={image.alt}
						width={1024}
						height={1024}
						src={image.url}
					/>
				</div>
			))}
		</div>
	);
}

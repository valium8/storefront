import { clsx } from "clsx";
import { redirect } from "next/navigation";
import { LinkWithChannel } from "../atoms/LinkWithChannel";
import { type ProductListItemFragment, type VariantDetailsFragment } from "@/gql/graphql";
import { getHrefForVariant } from "@/lib/utils";

export function VariantSelector({
	variants,
	product,
	selectedVariant,
	channel,
}: {
	variants: readonly VariantDetailsFragment[];
	product: ProductListItemFragment;
	selectedVariant?: VariantDetailsFragment;
	channel: string;
}) {
	if (!selectedVariant && variants.length === 1 && variants[0]?.quantityAvailable) {
		redirect("/" + channel + getHrefForVariant({ productSlug: product.slug, variantId: variants[0].id }));
	}

	// Extract unique attributes for size and color
	const sizeAttribute = variants[0]?.attributes?.find(
		(attr) =>
			attr.attribute.name?.toLowerCase().includes("size") ||
			attr.attribute.slug?.toLowerCase().includes("size"),
	);
	const colorAttribute = variants[0]?.attributes?.find(
		(attr) =>
			attr.attribute.name?.toLowerCase().includes("color") ||
			attr.attribute.slug?.toLowerCase().includes("color"),
	);

	// Get unique values for each attribute
	const sizeValues = sizeAttribute
		? Array.from(
				new Set(
					variants
						.map(
							(v) =>
								v.attributes?.find((attr) => attr.attribute.id === sizeAttribute.attribute.id)?.values?.[0]
									?.name,
						)
						.filter(Boolean),
				),
			)
		: [];

	const colorValues = colorAttribute
		? Array.from(
				new Set(
					variants
						.map(
							(v) =>
								v.attributes?.find((attr) => attr.attribute.id === colorAttribute.attribute.id)?.values?.[0]
									?.name,
						)
						.filter(Boolean),
				),
			)
		: [];

	// Find variant based on selected attributes
	const findVariantByAttributes = (size?: string, color?: string) => {
		return variants.find((variant) => {
			const variantSize = variant.attributes?.find(
				(attr) => attr.attribute.id === sizeAttribute?.attribute.id,
			)?.values?.[0]?.name;
			const variantColor = variant.attributes?.find(
				(attr) => attr.attribute.id === colorAttribute?.attribute.id,
			)?.values?.[0]?.name;

			const sizeMatch = !size || variantSize === size;
			const colorMatch = !color || variantColor === color;

			return sizeMatch && colorMatch && variant.quantityAvailable;
		});
	};

	// Get current selected values
	const currentSize =
		selectedVariant?.attributes?.find((attr) => attr.attribute.id === sizeAttribute?.attribute.id)
			?.values?.[0]?.name || undefined;
	const currentColor =
		selectedVariant?.attributes?.find((attr) => attr.attribute.id === colorAttribute?.attribute.id)
			?.values?.[0]?.name || undefined;

	return (
		variants.length > 1 && (
			<div className="my-4 space-y-4" data-testid="VariantSelector">
				{sizeValues.length > 0 && (
					<div>
						<label className="mb-2 block text-sm font-medium text-neutral-900">Size</label>
						<div className="flex flex-wrap gap-2">
							{sizeValues.map((size) => {
								const isSelected = currentSize === size;
								const variant = findVariantByAttributes(size, currentColor);
								const isDisabled = !variant;

								return (
									<LinkWithChannel
										key={size}
										prefetch={true}
										scroll={false}
										href={
											isDisabled
												? "#"
												: getHrefForVariant({
														productSlug: product.slug,
														variantId: variant?.id,
													})
										}
										className={clsx(
											isSelected
												? "border-transparent bg-neutral-900 text-white hover:bg-neutral-800"
												: "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100",
											"relative flex min-w-[5ch] items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap rounded border p-3 text-center text-sm font-semibold focus-within:outline focus-within:outline-2 aria-disabled:cursor-not-allowed aria-disabled:bg-neutral-100 aria-disabled:text-neutral-800 aria-disabled:opacity-50",
											isDisabled && "pointer-events-none",
										)}
										role="radio"
										tabIndex={isDisabled ? -1 : undefined}
										aria-checked={isSelected}
										aria-disabled={isDisabled}
									>
										{size}
									</LinkWithChannel>
								);
							})}
						</div>
					</div>
				)}

				{colorValues.length > 0 && (
					<div>
						<label className="mb-2 block text-sm font-medium text-neutral-900">Color</label>
						<div className="flex flex-wrap gap-2">
							{colorValues.map((color) => {
								const isSelected = currentColor === color;
								const variant = findVariantByAttributes(currentSize, color);
								const isDisabled = !variant;

								return (
									<LinkWithChannel
										key={color}
										prefetch={true}
										scroll={false}
										href={
											isDisabled
												? "#"
												: getHrefForVariant({
														productSlug: product.slug,
														variantId: variant?.id,
													})
										}
										className={clsx(
											isSelected
												? "border-transparent bg-neutral-900 text-white hover:bg-neutral-800"
												: "border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-100",
											"relative flex min-w-[5ch] items-center justify-center overflow-hidden text-ellipsis whitespace-nowrap rounded border p-3 text-center text-sm font-semibold focus-within:outline focus-within:outline-2 aria-disabled:cursor-not-allowed aria-disabled:bg-neutral-100 aria-disabled:text-neutral-800 aria-disabled:opacity-50",
											isDisabled && "pointer-events-none",
										)}
										role="radio"
										tabIndex={isDisabled ? -1 : undefined}
										aria-checked={isSelected}
										aria-disabled={isDisabled}
									>
										{color}
									</LinkWithChannel>
								);
							})}
						</div>
					</div>
				)}
			</div>
		)
	);
}

import { ProductListByCollectionDocument, ProductListDocument } from "@/gql/graphql";
import { executeGraphQL } from "@/lib/graphql";
import { ProductList } from "@/ui/components/ProductList";
import { ProductsPerPage } from "@/app/config";

export const metadata = {
	title: "ACME Storefront, powered by Saleor & Next.js",
	description:
		"Storefront Next.js Example for building performant e-commerce experiences with Saleor - the composable, headless commerce platform for global brands.",
};

export default async function Page(props: { params: Promise<{ channel: string }> }) {
	const params = await props.params;
	
	let products;

	// Try to fetch from featured-products collection first
	try {
		const collectionData = await executeGraphQL(ProductListByCollectionDocument, {
			variables: {
				slug: "featured-products",
				channel: params.channel,
			},
			revalidate: 60,
		});

		// If collection exists and has products, use them
		if (collectionData.collection?.products && collectionData.collection.products.edges.length > 0) {
			products = collectionData.collection.products.edges.map(({ node: product }) => product);
		}
	} catch (error) {
		// Collection doesn't exist or query failed, will fallback to all products
		console.log("Could not fetch featured-products collection, falling back to all products");
	}

	// If no products from collection, fetch all products
	if (!products || products.length === 0) {
		const allProductsData = await executeGraphQL(ProductListDocument, {
			variables: {
				first: ProductsPerPage,
				channel: params.channel,
			},
			revalidate: 60,
		});
		products = allProductsData.products?.edges.map(({ node: product }) => product) ?? [];
	}

	return (
		<section className="mx-auto max-w-7xl p-8 pb-16">
			<h2 className="sr-only">Product list</h2>
			<ProductList products={products} />
		</section>
	);
}

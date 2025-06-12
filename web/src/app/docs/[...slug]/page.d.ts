/// <reference types="react" />
export declare function generateStaticParams(): Promise<{
    slug: string[];
}[]>;
export default function DocPage({ params }: {
    params: {
        slug: string[];
    };
}): Promise<import("react").JSX.Element>;

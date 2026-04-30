import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AddToCartButton } from "@/app/[locale]/(shop)/components/AddToCartButton";
import { CartDrawer } from "@/app/[locale]/(shop)/components/CartDrawer";
import { useCartStore } from "../../src/lib/cart/store";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    const { fill: _fill, ...rest } = props;
    return <img {...rest} />;
  },
}));

describe("cart interactions", () => {
  beforeEach(() => {
    localStorage.clear();
    useCartStore.setState({ item: null, isOpen: false });
  });

  it("adds an artwork to the cart and opens the drawer", async () => {
    const user = userEvent.setup();

    render(
      <AddToCartButton
        locale="en"
        artworkId="art-1"
        artistId="artist-1"
        slug="lichtfragment-i"
        title="Lichtfragment I"
        imageUrl="https://cdn.elbtronika.art/artworks/seed-001/image.jpg"
        priceEur={1200}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(useCartStore.getState().item).toMatchObject({
      artworkId: "art-1",
      artistId: "artist-1",
      title: "Lichtfragment I",
      priceCents: 120000,
    });
    expect(useCartStore.getState().isOpen).toBe(true);
  });

  it("removes the item from the open cart drawer", async () => {
    const user = userEvent.setup();

    useCartStore.setState({
      isOpen: true,
      item: {
        artworkId: "art-1",
        artistId: "artist-1",
        slug: "lichtfragment-i",
        title: "Lichtfragment I",
        imageUrl: "https://cdn.elbtronika.art/artworks/seed-001/image.jpg",
        priceCents: 120000,
        currency: "EUR",
      },
    });

    render(<CartDrawer locale="en" />);

    await user.click(screen.getByRole("button", { name: "Remove" }));

    expect(useCartStore.getState().item).toBeNull();
    expect(screen.getByText("Your cart is empty.")).toBeTruthy();
  });
});
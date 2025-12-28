import { describe, it, expect } from "vitest";
import { createSvgTextBuffer } from "../../../core/utils/svg/createSvgTextBuffer.js";

describe("createSvgTextBuffer", () => {
  it("returns a Buffer containing an SVG", () => {
    const buffer = createSvgTextBuffer({
      text: "Hello",
      maxWidth: 100,
      maxHeight: 50,
      fontSize: 20,
      fill: "#ff0000",
    });

    expect(buffer).toBeInstanceOf(Buffer);

    const svg = buffer.toString();
    expect(svg).toContain("<svg");
    expect(svg).toContain("</svg>");
    expect(svg).toContain("Hello");
    expect(svg).toContain('fill="#ff0000"');
    expect(svg).toContain('font-size="20"');
  });

  it("uses default fill color when fill is not provided", () => {
    const buffer = createSvgTextBuffer({
      text: "Test",
      maxWidth: 80,
      maxHeight: 40,
      fontSize: 16,
    });

    const svg = buffer.toString();
    expect(svg).toContain('fill="#000000"');
  });

  it("escapes XML-unsafe characters in text", () => {
    const buffer = createSvgTextBuffer({
      text: `<Hello & "World">`,
      maxWidth: 100,
      maxHeight: 50,
      fontSize: 14,
    });

    const svg = buffer.toString();

    // Observable behavior: escaped output
    expect(svg).toContain("&lt;Hello &amp; &quot;World&quot;&gt;");
    expect(svg).not.toContain(`<Hello & "World">`);
  });

  it("handles empty text", () => {
    const buffer = createSvgTextBuffer({
      text: "",
      maxWidth: 50,
      maxHeight: 25,
      fontSize: 10,
    });

    const svg = buffer.toString();
    expect(svg).toContain("<text");
  });

  it("handles non-integer width, height, and fontSize", () => {
    const buffer = createSvgTextBuffer({
      text: "Numbers",
      maxWidth: 99.5,
      maxHeight: 20.25,
      fontSize: 12.75,
      fill: "#123456",
    });

    const svg = buffer.toString();

    expect(svg).toContain('width="99.5"');
    expect(svg).toContain('height="20.25"');
    expect(svg).toContain('font-size="12.75"');
  });

  it("handles very small and very large dimensions", () => {
    const small = createSvgTextBuffer({
      text: "S",
      maxWidth: 1,
      maxHeight: 1,
      fontSize: 1,
    });

    const large = createSvgTextBuffer({
      text: "L",
      maxWidth: 10000,
      maxHeight: 5000,
      fontSize: 500,
    });

    expect(small.toString()).toContain('width="1"');
    expect(large.toString()).toContain('width="10000"');
  });
});

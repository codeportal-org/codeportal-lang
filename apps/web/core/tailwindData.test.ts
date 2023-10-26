import { generateTailwindClassesData } from "./tailwindData"

describe("generateTailwindClassesData", () => {
  const data = generateTailwindClassesData()
  const classNames = data.map((item) => item.className)

  it("should generate aspect ratio classes", () => {
    const expectedClassNames = ["aspect-auto", "aspect-square", "aspect-video"]

    const areAllClassNamesPresent = expectedClassNames.every((className) =>
      classNames.includes(className),
    )

    expect(areAllClassNamesPresent).toBe(true)
  })

  it("should generate the container class", () => {
    expect(classNames.includes("container")).toBe(true)
    expect(classNames.includes("mx-auto")).toBe(true)
  })

  it("should generate columns classes", () => {
    const expectedClassNames = [
      "columns-1",
      "columns-5",
      "columns-auto",
      "columns-7xl",
      "columns-[arbitrary_dimension]",
    ]

    const areAllClassNamesPresent = expectedClassNames.every((className) =>
      classNames.includes(className),
    )

    expect(areAllClassNamesPresent).toBe(true)
  })

  it("should generate padding classes and there should be one of each", () => {
    const expectedClassNames = [
      "px-0",
      "py-1",
      "pt-2",
      "pr-3",
      "pb-4",
      "pl-5",
      "px-[arbitrary_dimension]",
      "pl-[arbitrary_dimension]",
    ]

    const areAllClassNamesPresent = expectedClassNames.every((className) =>
      classNames.includes(className),
    )

    const px0Count = classNames.filter((className) => className === "px-0").length
    const pl5Count = classNames.filter((className) => className === "pl-5").length
    const plArbitraryCount = classNames.filter(
      (className) => className === "pl-[arbitrary_dimension]",
    ).length

    expect(areAllClassNamesPresent).toBe(true)
    expect(px0Count).toBe(1)
    expect(pl5Count).toBe(1)
    expect(plArbitraryCount).toBe(1)
  })

  it("should generate margin classes", () => {
    const expectedClassNames = [
      "mx-0",
      "my-1",
      "mt-2",
      "mr-3",
      "mb-4",
      "ml-5",
      "mx-[arbitrary_dimension]",
    ]

    const areAllClassNamesPresent = expectedClassNames.every((className) =>
      classNames.includes(className),
    )

    expect(areAllClassNamesPresent).toBe(true)
  })

  it("should generate width classes", () => {
    const expectedClassNames = [
      "w-0",
      "w-px",
      "w-0.5",
      "w-4",
      "w-32",
      "w-1/2",
      "w-3/6",
      "w-1/12",
      "w-auto",
      "w-full",
      "w-screen",
      "w-[arbitrary_dimension]",
    ]

    const areAllClassNamesPresent = expectedClassNames.every((className) =>
      classNames.includes(className),
    )

    expect(areAllClassNamesPresent).toBe(true)
  })

  it("should generate min-width classes", () => {
    const expectedClassNames = ["min-w-0", "min-w-full", "min-w-max", "min-w-[arbitrary_dimension]"]

    const areAllClassNamesPresent = expectedClassNames.every((className) =>
      classNames.includes(className),
    )

    expect(areAllClassNamesPresent).toBe(true)
  })

  it("should generate max-width classes", () => {
    const expectedClassNames = [
      "max-w-0",
      "max-w-full",
      "max-w-max",
      "max-w-7xl",
      "max-w-screen-sm",
      "max-w-[arbitrary_dimension]",
    ]

    const areAllClassNamesPresent = expectedClassNames.every((className) =>
      classNames.includes(className),
    )

    expect(areAllClassNamesPresent).toBe(true)
  })

  it("should generate height classes", () => {
    const expectedClassNames = [
      "h-0",
      "h-screen",
      "h-full",
      "h-1/2",
      "h-3/6",
      "h-1/12",
      "h-auto",
      "h-[arbitrary_dimension]",
    ]

    const areAllClassNamesPresent = expectedClassNames.every((className) =>
      classNames.includes(className),
    )

    expect(areAllClassNamesPresent).toBe(true)
  })

  it("should generate min-height classes", () => {
    const expectedClassNames = ["min-h-0", "min-h-[arbitrary_dimension]"]

    const areAllClassNamesPresent = expectedClassNames.every((className) =>
      classNames.includes(className),
    )

    expect(areAllClassNamesPresent).toBe(true)
  })

  it("should generate max-height classes", () => {
    const expectedClassNames = ["max-h-0", "max-h-screen", "max-h-[arbitrary_dimension]"]

    const areAllClassNamesPresent = expectedClassNames.every((className) =>
      classNames.includes(className),
    )

    expect(areAllClassNamesPresent).toBe(true)
  })

  it("should generate space between classes", () => {
    const expectedClassNames = [
      "space-x-0",
      "space-y-1",
      "space-x-2",
      "space-y-reverse",
      "space-x-[arbitrary_dimension]",
    ]

    const areAllClassNamesPresent = expectedClassNames.every((className) =>
      classNames.includes(className),
    )

    expect(areAllClassNamesPresent).toBe(true)
  })

  it("should generate text color classes", () => {
    const expectedClassNames = [
      "text-inherit",
      "text-current",
      "text-transparent",
      "text-black",
      "text-white",
      "text-slate-50",
      "text-slate-100",
      "text-gray-100",
      "text-red-500",
      "text-emerald-500",
      "text-green-950",
      "text-[arbitrary_color]",
    ]

    const areAllClassNamesPresent = expectedClassNames.every((className) =>
      classNames.includes(className),
    )

    expect(areAllClassNamesPresent).toBe(true)
  })

  it("should generate text decoration color classes", () => {
    const expectedClassNames = [
      "decoration-inherit",
      "decoration-black",
      "decoration-white",
      "decoration-slate-50",
      "decoration-emerald-500",
      "decoration-green-950",
    ]

    const areAllClassNamesPresent = expectedClassNames.every((className) =>
      classNames.includes(className),
    )

    expect(areAllClassNamesPresent).toBe(true)
  })

  it("should generate background color classes", () => {
    const expectedClassNames = [
      "bg-inherit",
      "bg-black",
      "bg-white",
      "bg-slate-100",
      "bg-red-500",
      "bg-green-950",
      "bg-[arbitrary_color]",
    ]

    const areAllClassNamesPresent = expectedClassNames.every((className) =>
      classNames.includes(className),
    )

    expect(areAllClassNamesPresent).toBe(true)
  })

  it("should generate border color classes", () => {
    const expectedClassNames = [
      "border-inherit",
      "border-red-500",
      // border-x
      "border-x-inherit",
      "border-x-red-500",
      // border-y
      "border-y-inherit",
      "border-y-red-500",
      // border-s
      "border-s-inherit",
      "border-s-red-500",
      // border-e
      "border-e-inherit",
      "border-e-red-500",
      // border-t
      "border-t-inherit",
      "border-t-red-500",
      // border-r
      "border-r-inherit",
      "border-r-red-500",
      // border-b
      "border-b-inherit",
      "border-b-red-500",
      // border-l
      "border-l-inherit",
      "border-l-red-500",
      "border-l-[arbitrary_color]",
    ]

    const areAllClassNamesPresent = expectedClassNames.every((className) =>
      classNames.includes(className),
    )

    expect(areAllClassNamesPresent).toBe(true)
  })

  it("should generate accent color classes", () => {
    const expectedClassNames = [
      "accent-auto",
      "accent-inherit",
      "accent-black",
      "accent-white",
      "accent-slate-100",
      "accent-red-500",
      "accent-green-950",
      "accent-[arbitrary_color]",
    ]

    const areAllClassNamesPresent = expectedClassNames.every((className) =>
      classNames.includes(className),
    )

    expect(areAllClassNamesPresent).toBe(true)
  })

  it("should generate caret color classes", () => {
    const expectedClassNames = [
      "caret-inherit",
      "caret-black",
      "caret-white",
      "caret-slate-100",
      "caret-red-500",
      "caret-green-950",
      "caret-[arbitrary_color]",
    ]

    const areAllClassNamesPresent = expectedClassNames.every((className) =>
      classNames.includes(className),
    )

    expect(areAllClassNamesPresent).toBe(true)
  })

  it("should generate SVG fill color classes", () => {
    const expectedClassNames = [
      "fill-none",
      "fill-inherit",
      "fill-black",
      "fill-white",
      "fill-slate-100",
      "fill-red-500",
      "fill-green-950",
      "fill-[arbitrary_color]",
    ]

    const areAllClassNamesPresent = expectedClassNames.every((className) =>
      classNames.includes(className),
    )

    expect(areAllClassNamesPresent).toBe(true)
  })

  it("should generate SVG stroke color classes", () => {
    const expectedClassNames = [
      "stroke-none",
      "stroke-inherit",
      "stroke-black",
      "stroke-slate-100",
      "stroke-red-500",
      "stroke-[arbitrary_color]",
    ]

    const areAllClassNamesPresent = expectedClassNames.every((className) =>
      classNames.includes(className),
    )

    expect(areAllClassNamesPresent).toBe(true)
  })

  it("should generate font smoothing classes by taking into account the prefixes", () => {
    const expectedClassNames = ["antialiased", "subpixel-antialiased"]

    const areAllClassNamesPresent = expectedClassNames.every((className) =>
      classNames.includes(className),
    )

    expect(areAllClassNamesPresent).toBe(true)
  })

  it("should generate font style classes by taking into account the prefixes", () => {
    const expectedClassNames = ["italic", "not-italic"]

    const areAllClassNamesPresent = expectedClassNames.every((className) =>
      classNames.includes(className),
    )

    expect(areAllClassNamesPresent).toBe(true)
  })

  it("should generate content classes and generate the arbitrary values class", () => {
    const expectedClassNames = ["content-none", "content-[arbitrary_string]"]

    const areAllClassNamesPresent = expectedClassNames.every((className) =>
      classNames.includes(className),
    )

    expect(areAllClassNamesPresent).toBe(true)
  })
})

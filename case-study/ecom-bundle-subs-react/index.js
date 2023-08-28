import htm from "htm"
import React, { useState } from "react"
import { createRoot } from "react-dom/client"

// Initialize htm with React
const html = htm.bind(React.createElement)

const _space = "\u00A0"

const products = [
  {
    name: "Product 1",
    price: 5.99,
    variantId: "1",
    photoUrl:
      "https://fastly.picsum.photos/id/3/90/190.jpg?hmac=FoSJfSm-vgWwwIPzESxFtKUpedDYyxoT0PhoJoTvD1Y",
  },
  {
    name: "Product 2",
    price: 3.99,
    variantId: "2",
    photoUrl:
      "https://fastly.picsum.photos/id/27/90/190.jpg?hmac=M-r3TcmoBZmrgFAF8LITXnuf3L2AabnjBN-QGXs65j4",
  },
  {
    name: "Product 3",
    price: 2.99,
    variantId: "3",
    photoUrl:
      "https://fastly.picsum.photos/id/15/90/190.jpg?hmac=Og58lc6FoO68zZb73flMqyNOn0htBTRYlKNlGHyKM9Q",
  },
  {
    name: "Product 4",
    price: 6.99,
    variantId: "4",
    photoUrl:
      "https://fastly.picsum.photos/id/20/90/190.jpg?hmac=rmSVulqHgZSJep1i0s05BJ2j7Cgs_R32JcZPqlUfnro",
  },
  {
    name: "Product 5",
    price: 10.99,
    variantId: "5",
    photoUrl:
      "https://fastly.picsum.photos/id/33/90/190.jpg?hmac=teRii-QfFBgM-UDlJo3IAQo8Vy9OpVid-OYbyzI0erY",
  },
]

const discounts = [
  {
    name: "5 Products",
    max: 5,
    discount: 0.25,
    color: "#F5A623",
  },
  {
    name: "4 Products",
    max: 4,
    discount: 0.15,
    color: "#A5A623",
  },
  {
    name: "3 Products",
    max: 3,
    discount: 0.1,
    color: "#55A623",
  },
]

const plans = [
  {
    id: "15-days",
    name: "Deliver Every 15 Days",
  },
  {
    id: "30-days",
    name: "Deliver Every 30 Days",
  },
  {
    id: "45-days",
    name: "Deliver Every 45 Days",
  },
]

function ProductSelectWrapper(props) {
  const product = props.product
  const state = props.state

  return html`
    <div className="product-select-wrapper">
      <div className="product-add">
        <div className="product-select-title">${product.name}</div>
        <img
          className="product-bottle-photo"
          loading="lazy"
          src=${product.photoUrl}
          alt="Tequila Alternative"
        />
      </div>
      <div className="product-select-quantity-wrap">
        ${state.quantity === 0
          ? html`<button className="product-select-quantity-increment" onClick=${props.onIncrement}>
              <span className="product-select-quantity-increment-add-text">ADD</span>
            </button>`
          : html`<div className="flex items-center gap-1">
              <button className="px-2 py-1" onClick=${props.onDecrement}>—</button>
              <div className="product-select-quantity-input-display">${state.quantity}</div>
              <button className="px-2 py-1" onClick=${props.onIncrement}>+</button>
            </div>`}
      </div>
    </div>
  `
}

function App(props) {
  const [boxSize, setBoxSize] = useState(5)
  const [planId, setPlanId] = useState("15-days")
  const [visualProductStack, setVisualProductStack] = useState([])

  const [productVariantState, setProductVariantState] = useState(() =>
    products.reduce((acc, product) => {
      acc[product.variantId] = {
        quantity: 0,
      }
      return acc
    }, {}),
  )

  const totalNumSelections = visualProductStack.length

  const currentDiscount = discounts.find((discount) => discount.max === boxSize)

  function handleIncrement(productVariantId) {
    if (totalNumSelections < boxSize) {
      setProductVariantState((prevState) => {
        return {
          ...prevState,
          [productVariantId]: {
            quantity: prevState[productVariantId].quantity + 1,
          },
        }
      })

      setVisualProductStack((prevState) => {
        return [...prevState, productVariantId]
      })
    }
  }

  function handleDecrement(productVariantId) {
    if (productVariantState[productVariantId].quantity > 0) {
      setProductVariantState((prevState) => {
        return {
          ...prevState,
          [productVariantId]: {
            quantity: prevState[productVariantId].quantity - 1,
          },
        }
      })

      setVisualProductStack((prevState) => {
        const index = prevState.indexOf(productVariantId)
        if (index > -1) {
          prevState.splice(index, 1)
        }
        return prevState
      })
    }
  }

  function handleRemoveFromStack(index) {
    const productVariantId = visualProductStack[index]

    setProductVariantState((prevState) => {
      return {
        ...prevState,
        [productVariantId]: {
          quantity: prevState[productVariantId].quantity - 1,
        },
      }
    })

    setVisualProductStack((prevState) => {
      prevState.splice(index, 1)
      return prevState
    })
  }

  function handleBoxSize(max) {
    setBoxSize(max)

    if (max < totalNumSelections) {
      const removedItems = visualProductStack.slice(max)
      removedItems.forEach((item) => {
        setProductVariantState((prevState) => {
          return {
            ...prevState,
            [item]: {
              quantity: prevState[item].quantity - 1,
            },
          }
        })
      })

      setVisualProductStack((prevState) => {
        return prevState.slice(0, max)
      })
    }
  }

  function handleCheckoutClick() {
    const bundleSellingPlanId = products
      .find((product) => product.variantId === visualProductStack[0])
      .SellingPlanGroups.find((spg) => spg.node.name === bundleSellingPlanName).node.id

    const bundleProductData = {
      variantId: MixMatchSubscriptionBox.gid,
      handle: "mix-match-subscription-box",
      sellingPlan: bundleSellingPlanId,
    }

    const bundle = {
      externalVariantId: bundleProductData.variantId,
      externalProductId: bundleProductData.productId,
      selections: visualProductStack.map((productVariantId) => {
        const productData = products.find((p) => p.variantId === productVariantId)
        return {
          collectionId: "262223331412", // STATIC Spirits Collection
          externalVariantId: productVariantId,
          quantity: productVariantState[productVariantId].quantity,
          sellingPlan: productData.SellingPlanGroups.find(
            (spg) => spg.node.name === bundleSellingPlanName,
          ).node.id,
        }
      }),
    }
    console.log("bundle", bundle)
    console.log("Adding Bundle To Cart.")
  }

  return html`
    <div className="main-container">
      <div className="left-side bundle-page">
        <h2 className="bold">Case Study: Bundle Subscription Box</h2>
        <div className="flex gap-2">
          ${products.map((product) => {
            return html`<${ProductSelectWrapper}
              key=${product.variantId}
              product=${product}
              state=${productVariantState[product.variantId]}
              onIncrement=${() => handleIncrement(product.variantId)}
              onDecrement=${() => handleDecrement(product.variantId)}
            />`
          })}
        </div>
      </div>

      <div className="right-side buybox">
        <div className="bundle-header">
          <div className="subheader">Always free shipping on every order</div>
          <div className="header">
            Subscribe & save!<br />
            Get more ritual for less.
          </div>
        </div>

        <div className="buybox-inner">
          <div className="choose-your-box-size">
            <span className="choose-your-box-title">1. Choose Your Box Size</span>
            <div className="flex gap-2">
              ${discounts.map((discount) => {
                return html`
                  <div
                    key=${discount.name}
                    className="box-size-select"
                    onClick=${() => handleBoxSize(discount.max)}
                  >
                    <input
                      className="radio-box-size-button"
                      type="radio"
                      name="discount"
                      value=${discount.max}
                      checked=${discount.max === boxSize}
                      onChange=${(event) => {
                        handleBoxSize(parseInt(event.target.value))
                      }}
                    />

                    <div className="box-size">${discount.name}</div>

                    <div
                      className="box-size-savings savings"
                      style=${{ backgroundColor: discount.color }}
                    >
                      Save ${discount.discount * 100}%
                    </div>
                  </div>
                `
              })}
            </div>
          </div>

          <div className="select-your-flavors">
            <div className="select-your-flavors-text">2. Select Your Flavors</div>
            <div className="flex flex-wrap gap-2">
              ${visualProductStack.map((product, index) => {
                const productData = products.find((p) => p.variantId === product)

                return html`
                  <div key=${index} className="bundle-builder-selected-product">
                    <button className="remove-button" onClick=${() => handleRemoveFromStack(index)}>
                      <span className="remove-button-text">Remove</span>
                    </button>
                    <img src=${productData.photoUrl} />
                  </div>
                `
              })}
              ${Array.from({ length: boxSize - totalNumSelections }, (_, i) => {
                return html`
                  <div
                    key=${i}
                    className="border border-dashed border-slate-400"
                    style=${{ width: "90px", height: "190px" }}
                  ></div>
                `
              })}
            </div>
          </div>

          <div>
            <div>
              <div>
                <div className="interval-name">Subscribe & ${_space}</div>
                <div
                  className="box-size-savings savings"
                  style=${{ backgroundColor: currentDiscount.color }}
                >
                  Save ${currentDiscount.discount * 100}%
                </div>
              </div>
              <div className="total-price">
                $${(
                  visualProductStack.reduce((acc, product) => {
                    const productData = products.find((p) => p.variantId === product)
                    return acc + productData.price
                  }, 0) *
                  (1 - currentDiscount.discount)
                ).toFixed(2)}
              </div>
            </div>

            <div>
              <select value=${planId} onChange=${(event) => setPlanId(event.target.value)}>
                ${plans.map((plan) => {
                  return html` <option key=${plan.id} value=${plan.id}>${plan.name}</option> `
                })}
              </select>
            </div>
          </div>
        </div>
        ${boxSize > totalNumSelections
          ? html`<button className="add-button">
              Add${_space}<span>${boxSize - totalNumSelections}</span>${_space}More Bottles
            </button>`
          : html`<button className="add-button yellow" onClick=${handleCheckoutClick}>
              Continue To Checkout
            </button>`}
      </div>
    </div>
  `
}

const rootElm = document.getElementById("root")

const root = createRoot(rootElm)
root.render(html`<${App} />`)

import { useContext, useState } from "react";
import { CartContext } from "../_context/cart";
import CartItem from "./cart-item";
import { Card, CardContent } from "./ui/card";
import { formatCurrency } from "./_helpers/price";
import { Separator } from "./ui/separator";
import { Button } from "./ui/button";
import { useSession } from "next-auth/react";
import { createOrder } from "../_actions/order";
import { Decimal } from "@prisma/client/runtime/library";
import { OrderStatus } from "@prisma/client";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import { AlertDialogCancel } from "@radix-ui/react-alert-dialog";

const Cart = () => {
  const { data } = useSession();

  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isConfirmeDialogOpen, setIsConfirmeDialogOpen] = useState(false);

  const { products, subtotalPrice, totalDiscounts, totalPrice, clearCart } =
    useContext(CartContext);

  const handleFinishOrderClick = async () => {
    if (!data?.user) return;

    const restaurant = products[0].restaurant;

    try {
      setIsSubmitLoading(true);
      await createOrder({
        subtotalPrice,
        totalDiscounts,
        totalPrice,
        deliveryFee: restaurant.deliveryFee as Decimal,
        deliveryTimeMinutes: restaurant.deliveryTimeMinutes,
        restaurant: {
          connect: { id: restaurant.id },
        },
        status: OrderStatus.CONFIRMERD,
        user: {
          connect: { id: data.user.id },
        },
      });
    } catch (err) {
      console.log(err);
    } finally {
      setIsSubmitLoading(false);
      clearCart();
    }
  };

  return (
    <>
      {products.length > 0 ? (
        <div className="flex h-full flex-col py-5">
          <div className="flex-auto space-y-4">
            {products.map((product) => (
              <CartItem key={product.id} cartProduct={product} />
            ))}
          </div>
          <>
            <div className="mt-6">
              <Card>
                <CardContent className=" space-y-2 p-5">
                  <div className=" flex items-center justify-between text-sm">
                    <span className=" text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(subtotalPrice)}</span>
                  </div>
                  <Separator />

                  <div className=" flex items-center justify-between text-sm">
                    <span className=" text-muted-foreground">Desconto</span>
                    <span> - {formatCurrency(totalDiscounts)}</span>
                  </div>
                  <Separator />

                  <div className=" flex items-center justify-between text-sm">
                    <span className=" text-muted-foreground">Entrega</span>
                    {Number(products?.[0].restaurant.deliveryFee) === 0 ? (
                      <span className=" uppercase text-primary">Grátis</span>
                    ) : (
                      formatCurrency(
                        Number(products?.[0].restaurant.deliveryFee),
                      )
                    )}
                  </div>
                  <Separator />

                  <div className=" flex items-center justify-between text-sm font-semibold">
                    <span>Total</span>
                    <span>{formatCurrency(totalPrice)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Button
              className="mt-6 w-full"
              disabled={isSubmitLoading}
              onClick={() => setIsConfirmeDialogOpen(true)}
            >
              Finalizar pedido
            </Button>
          </>
        </div>
      ) : (
        <h2 className=" mt-6 text-center font-medium">
          Sua sacola está vazia.
        </h2>
      )}

      <AlertDialog
        open={isConfirmeDialogOpen}
        onOpenChange={setIsConfirmeDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deseja finalizar seu pedido?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitLoading}>
              {isSubmitLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleFinishOrderClick}>
              Continuar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Cart;

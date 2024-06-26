"use client";

import { formatCurrency } from "@/app/_components/_helpers/price";
import { Avatar, AvatarImage } from "@/app/_components/ui/avatar";
import { Button } from "@/app/_components/ui/button";
import { Card, CardContent } from "@/app/_components/ui/card";
import { Separator } from "@/app/_components/ui/separator";
import { OrderStatus, Prisma } from "@prisma/client";
import { ChevronRightIcon } from "lucide-react";
import Link from "next/link";

interface OrderItemProps {
  order: Prisma.OrderGetPayload<{
    include: {
      restaurant: true;
      products: {
        include: {
          product: true;
        };
      };
    };
  }>;
}

const getOrderStatus = (status: OrderStatus) => {
  switch (status) {
    case "CANCELED":
      return "Cancelado";
    case "COMPLETED":
      return "Finalizado";
    case "CONFIRMERD":
      return "Confirmado";
    case "DELIVERING":
      return "Em transporte";
    case "PREPARING":
      return "Preparando";
  }
};

const OrderItem = ({ order }: OrderItemProps) => {
  return (
    <Card>
      <CardContent className="p-5">
        <div
          className={`w-fit rounded-full bg-[#EEEE] px-2 py-1 text-muted-foreground 
          ${order.status != "COMPLETED" && "bg-green-500 text-white"} `}
        >
          <span className="block text-xs font-semibold">
            {getOrderStatus(order.status)}
          </span>
        </div>
        <div className=" flex items-center justify-between pt-3">
          <div className=" flex items-center gap-2">
            <Avatar className=" h-6 w-6">
              <AvatarImage src={order.restaurant.imageUrl} />
            </Avatar>
            <span className="text-sm font-semibold">
              {order.restaurant.name}
            </span>
          </div>
          <Button
            variant="link"
            size="icon"
            className=" h-5 w-5 text-black"
            asChild
          >
            <Link href={`/restaurant/${order.restaurantId}`}>
              <ChevronRightIcon />
            </Link>
          </Button>
        </div>

        <div className="py-3">
          <Separator />
        </div>

        <div className="space-y-2">
          {order.products.map((product) => (
            <div key={product.id} className=" flex items-center gap-2">
              <div className=" flex h-5 w-5 items-center justify-center rounded-full bg-muted-foreground">
                <span className="block text-sm text-white">
                  {product.quantity}
                </span>
              </div>
              <span className="block text-sm text-muted-foreground">
                {product.product.name}
              </span>
            </div>
          ))}
        </div>

        <div className="py-3">
          <Separator />
        </div>
        <div className=" flex items-center justify-between">
          <p className="text-sm">{formatCurrency(Number(order.totalPrice))}</p>
          <Button
            variant="ghost"
            size="sm"
            className="text-sm text-primary"
            disabled={order.status != "COMPLETED"}
          >
            Refazer pedido
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderItem;

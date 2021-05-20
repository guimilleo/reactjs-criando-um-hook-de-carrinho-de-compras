import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    // const storagedCart = Buscar dados do localStorage

    // if (storagedCart) {
    //   return JSON.parse(storagedCart);
    // }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      if (cart.find(product => product.id === productId))
        throw new Error('Produto já adicionado no carrinho');
      else
        api.get("stock/" + productId)
        .then(response => {
          if(response.data.amount >= 1)
            api.get("products/" + productId)
              .then(response => { 
                response.data['amount'] = 1
                setCart([...cart, response.data])
                toast.success('Produto adicionado com sucesso ao carrinho!', {
                  position: "top-right",
                  autoClose: 2000,
                  hideProgressBar: true,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  });
              })
          else
            throw new Error('Produto sem estoque :(');
        })
      
    } catch (err) {
      toast.error(err.message, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        });
    }
  };

  const removeProduct = (productId: number) => {
    try {
      if (cart.find(product => product.id === productId))
        setCart(cart.filter((product) => {
          return productId != product.id
        }))
      else
        throw new Error('Produto não está no carrinho');
    } catch (err) {
      toast.error(err.message, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        });
      }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (cart.find(product => product.id === productId))
        api.get("stock/" + productId)
        .then(response => {
          const newCart = cart.map(product => {
            if (product.id === productId && response.data.amount > product.amount + amount)
              product.amount += amount
            return product
          })
          setCart(newCart)
        })
      else
        throw new Error('Produto não está no carrinho');
    } catch (err) {
      toast.error(err.message, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}

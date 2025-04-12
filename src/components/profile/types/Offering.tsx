

export interface Offering {
    _id: string;
    title: string;
    description: string;
    type: string;
    price: {
      amount: number;
      currency: string;
    };
    discounted_price: number;
    duration: number;
    is_free: boolean;
    tags: string[];
    rating: number;
    total_ratings: number;
  }

  
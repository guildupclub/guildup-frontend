export const contentCategories = [
  "All", 
  "Community", 
  "Networking", 
  "Content", 
  "Branding", 
  "Business", 
  "Psychology"
];

export interface CategoryConfig {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export const categoryConfigs: CategoryConfig[] = [
  {
    id: "All",
    name: "All Topics",
    color: "bg-gray-100",
    description: "All content types"
  },
  {
    id: "Community",
    name: "Community",
    color: "bg-blue-100",
    description: "Community building and management"
  },
  {
    id: "Networking",
    name: "Networking",
    color: "bg-green-100",
    description: "Professional networking and relationships"
  },
  {
    id: "Content",
    name: "Content",
    color: "bg-purple-100",
    description: "Content creation and strategy"
  },
  {
    id: "Branding",
    name: "Branding",
    color: "bg-yellow-100",
    description: "Personal and business branding"
  },
  {
    id: "Business",
    name: "Business",
    color: "bg-red-100",
    description: "Business strategy and monetization"
  },
  {
    id: "Psychology",
    name: "Psychology",
    color: "bg-indigo-100",
    description: "Psychology and behavioral insights"
  }
]; 
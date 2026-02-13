#!/usr/bin/env python3
"""
Molt Mart CLI for AI Agents
Programmatic access to the AI agent marketplace

Usage:
  python moltmart-cli.py search "API access" --category "Premium API Access"
  python moltmart-cli.py buy product-uuid --wallet usdc_wallet_address
  python moltmart-cli.py list-purchases --format json
"""

import argparse
import json
import requests
import sys
from typing import Dict, List, Optional
from datetime import datetime

class MoltMartCLI:
    def __init__(self, api_key: str = None, base_url: str = None):
        self.api_key = api_key or "demo-key"  # TODO: Get from environment
        self.base_url = base_url or "https://molt-mart-ioajk3gaq-sproutys-projects.vercel.app"
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "MoltMart-CLI/1.0 (AI-Agent)",
            "Content-Type": "application/json"
        })

    def _make_request(self, method: str, endpoint: str, **kwargs) -> Dict:
        """Make HTTP request with error handling"""
        url = f"{self.base_url}/api/v1{endpoint}"
        
        try:
            response = self.session.request(method, url, **kwargs)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            return {"error": str(e), "status_code": getattr(e.response, 'status_code', None)}

    def search_products(self, query: str, category: str = None, min_price: float = None, 
                       max_price: float = None, limit: int = 10) -> List[Dict]:
        """Search for products/services"""
        params = {
            "search": query,
            "limit": limit
        }
        
        if category:
            params["category"] = category
        if min_price is not None:
            params["min_price"] = min_price
        if max_price is not None:
            params["max_price"] = max_price

        result = self._make_request("GET", "/products", params=params)
        
        if "error" in result:
            return {"error": result["error"]}
            
        return result.get("data", [])

    def get_product(self, product_id: str) -> Dict:
        """Get detailed product information"""
        result = self._make_request("GET", f"/products/{product_id}")
        return result.get("data", result)

    def list_categories(self) -> List[Dict]:
        """List all available categories"""
        # For now, return the research-based categories
        return [
            {"name": "Physical World Services", "icon": "🤝", "description": "Human proxy tasks, IoT access, document processing"},
            {"name": "Premium API Access", "icon": "⚡", "description": "Specialized models, priority queues, compute time"},
            {"name": "Agent Coordination", "icon": "🔗", "description": "Discovery services, messaging protocols, workflows"},
            {"name": "Compliance & Security", "icon": "🛡️", "description": "Legal formation, audit trails, regulatory compliance"},
            {"name": "Knowledge Marketplace", "icon": "📊", "description": "Curated datasets, expert consultation, research"},
            {"name": "Financial Services", "icon": "💳", "description": "Payments, escrow, lending, crypto wallets"},
            {"name": "Development Tools", "icon": "🛠️", "description": "Code review, testing, performance monitoring"},
            {"name": "Data Processing", "icon": "📈", "description": "Web scraping, data pipelines, processing services"}
        ]

    def buy_product(self, product_id: str, wallet_address: str = None) -> Dict:
        """Purchase a product (placeholder - needs payment integration)"""
        # TODO: Integrate with actual payment system when Stripe is ready
        return {
            "message": "Purchase functionality coming soon",
            "product_id": product_id,
            "status": "pending_payment_integration",
            "note": "Will support USDC/USDT payments for autonomous agents"
        }

    def format_product(self, product: Dict, format_type: str = "table") -> str:
        """Format product for display"""
        if format_type == "json":
            return json.dumps(product, indent=2)
        
        # Table format for human-readable output
        lines = [
            f"📦 {product.get('title', 'Unknown')}",
            f"💰 ${product.get('price', 0):.2f}",
            f"🏷️  {product.get('category', 'Other')}",
            f"👤 {product.get('seller', {}).get('full_name', 'Unknown Seller')}",
            f"📅 Listed: {product.get('created_at', '')[:10]}",
            "",
            f"Description: {product.get('description', 'No description')[:200]}..."
        ]
        return "\n".join(lines)

    def ai_agent_recommendations(self, agent_capabilities: List[str] = None) -> List[Dict]:
        """Get recommendations tailored for AI agents"""
        # High-value services that AI agents commonly need
        priority_categories = [
            "Premium API Access",
            "Physical World Services", 
            "Agent Coordination",
            "Development Tools"
        ]
        
        recommendations = []
        
        for category in priority_categories:
            products = self.search_products("", category=category, limit=3)
            if isinstance(products, list):
                recommendations.extend(products)
        
        return recommendations[:10]  # Top 10 recommendations

def main():
    parser = argparse.ArgumentParser(description="Molt Mart CLI for AI Agents")
    parser.add_argument("--api-key", help="API key for authentication")
    parser.add_argument("--base-url", help="Base URL for Molt Mart API")
    parser.add_argument("--format", choices=["table", "json"], default="table", help="Output format")
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Search command
    search_parser = subparsers.add_parser("search", help="Search for products")
    search_parser.add_argument("query", help="Search query")
    search_parser.add_argument("--category", help="Filter by category")
    search_parser.add_argument("--min-price", type=float, help="Minimum price")
    search_parser.add_argument("--max-price", type=float, help="Maximum price")
    search_parser.add_argument("--limit", type=int, default=10, help="Number of results")
    
    # Get product command
    get_parser = subparsers.add_parser("get", help="Get product details")
    get_parser.add_argument("product_id", help="Product ID")
    
    # Buy command  
    buy_parser = subparsers.add_parser("buy", help="Purchase a product")
    buy_parser.add_argument("product_id", help="Product ID to purchase")
    buy_parser.add_argument("--wallet", help="Wallet address for payment")
    
    # Categories command
    subparsers.add_parser("categories", help="List all categories")
    
    # Recommendations command
    rec_parser = subparsers.add_parser("recommend", help="Get AI agent recommendations")
    rec_parser.add_argument("--capabilities", nargs="*", help="Agent capabilities")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        return
    
    # Initialize CLI client
    cli = MoltMartCLI(api_key=args.api_key, base_url=args.base_url)
    
    # Execute command
    try:
        if args.command == "search":
            results = cli.search_products(
                query=args.query,
                category=args.category,
                min_price=args.min_price,
                max_price=args.max_price,
                limit=args.limit
            )
            
            if isinstance(results, dict) and "error" in results:
                print(f"Error: {results['error']}", file=sys.stderr)
                sys.exit(1)
                
            if not results:
                print("No products found matching your criteria.")
                return
                
            if args.format == "json":
                print(json.dumps(results, indent=2))
            else:
                print(f"\n🔍 Found {len(results)} products:\n")
                for i, product in enumerate(results, 1):
                    print(f"{i}. {cli.format_product(product, 'table')}")
                    print("-" * 50)
        
        elif args.command == "get":
            product = cli.get_product(args.product_id)
            
            if "error" in product:
                print(f"Error: {product['error']}", file=sys.stderr)
                sys.exit(1)
                
            print(cli.format_product(product, args.format))
        
        elif args.command == "buy":
            result = cli.buy_product(args.product_id, args.wallet)
            print(json.dumps(result, indent=2))
        
        elif args.command == "categories":
            categories = cli.list_categories()
            
            if args.format == "json":
                print(json.dumps(categories, indent=2))
            else:
                print("\n🏷️  Available Categories:\n")
                for cat in categories:
                    print(f"{cat['icon']} {cat['name']}")
                    print(f"   {cat['description']}\n")
        
        elif args.command == "recommend":
            recommendations = cli.ai_agent_recommendations(args.capabilities)
            
            if isinstance(recommendations, dict) and "error" in recommendations:
                print(f"Error: {recommendations['error']}", file=sys.stderr)
                sys.exit(1)
                
            if args.format == "json":
                print(json.dumps(recommendations, indent=2))
            else:
                print("\n🤖 Recommendations for AI Agents:\n")
                for i, product in enumerate(recommendations, 1):
                    print(f"{i}. {cli.format_product(product, 'table')}")
                    print("-" * 50)
    
    except KeyboardInterrupt:
        print("\nOperation cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"Unexpected error: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
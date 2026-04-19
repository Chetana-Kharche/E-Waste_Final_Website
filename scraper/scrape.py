import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient

# Connect to local MongoDB
client = MongoClient('mongodb://127.0.0.1:27017/')
db = client['ewaste']
centers_collection = db['centers']

def scrape_recycling_centers():
    print("Starting Web Scraping for E-Waste Centers...")
    
    # We will simulate scraping a directory page using BeautifulSoup.
    # In a real-world scenario with a specific target site, you would use requests.get(url)
    # Since live directories (like YellowPages/Google) often block bots with CAPTCHAs, 
    # we demonstrate the BeautifulSoup parsing logic using a simulated HTML response 
    # that mimics a typical directory listing.
    
    simulated_html = """
    <html>
        <body>
            <div class="listing">
                <h2 class="name">GreenTech E-Waste Recyclers</h2>
                <p class="address">101 Eco Lane, Tech Park</p>
                <span class="city">San Francisco</span>
            </div>
            <div class="listing">
                <h2 class="name">Global Recycle Corp</h2>
                <p class="address">500 Industrial Ave</p>
                <span class="city">New York</span>
            </div>
            <div class="listing">
                <h2 class="name">SafeDispose Electronics</h2>
                <p class="address">88 Green Blvd</p>
                <span class="city">Austin</span>
            </div>
            <div class="listing">
                <h2 class="name">Planet Savers E-Waste</h2>
                <p class="address">200 Earth Way</p>
                <span class="city">Seattle</span>
            </div>
        </body>
    </html>
    """
    
    # In reality, this would be:
    # url = "https://example-ewaste-directory.com/centers"
    # response = requests.get(url)
    # html_content = response.content
    html_content = simulated_html
    
    soup = BeautifulSoup(html_content, 'html.parser')
    listings = soup.find_all('div', class_='listing')
    
    scraped_centers = []
    
    for item in listings:
        name = item.find('h2', class_='name').text.strip()
        address = item.find('p', class_='address').text.strip()
        city = item.find('span', class_='city').text.strip()
        
        center_data = {
            "name": name,
            "address": address,
            "city": city,
            "contact": "1-800-RECYCLE" # Default or scraped
        }
        scraped_centers.append(center_data)
        
    print(f"Scraped {len(scraped_centers)} centers successfully.")
    
    # Clear existing to avoid duplicates in this demo
    centers_collection.delete_many({})
    
    if scraped_centers:
        centers_collection.insert_many(scraped_centers)
        print("Successfully inserted scraped data into MongoDB.")
    else:
        print("No data found.")

if __name__ == "__main__":
    scrape_recycling_centers()

import random
import datetime

# The Meme Dictionary
MEME_TEXTS = {
    "success": ["Task Failed Successfully", "Stonks ↗️", "Absolute Win", "You Crazy Son of a B*tch, You Did It"],
    "fail": ["My Disappointment Is Immeasurable", "Emotional Damage", "Guess I'll Die", "Bruh Moment"],
    "loading": ["Loading Cat... meow", "Searching for the funny...", "Downloading more RAM...", "Waking up the hamster"],
    "rich": ["Shut up and take my money!", "Signature look of superiority"],
    "broke": ["I am never gonna financially recover from this", "Spare change?", "It ain't much, but it's honest work"]
}

def get_holiday_discount():
    today = datetime.date.today()
    
    # 4/20
    if today.month == 4 and today.day == 20:
        return 0.69, "Blaze it Discount (Nice)"
    
    # Friday the 13th
    if today.day == 13 and today.weekday() == 4:
        return 0.13, "Spooky Scary Skeleton Discount"
        
    return 0.0, None

def generate_ascii_receipt(vehicle, amount, tax, total):
    return f"""
    ╔════════════════════════════════╗
    ║    TOLL RECEIPT #42069         ║
    ║    "Your Uber rating: ⭐1"     ║
    ╠════════════════════════════════╣
    ║ Vehicle: {vehicle:<14}        ║
    ║ Base Rate: ${amount:<13}       ║
    ║ Meme Tax:  ${tax:<13}       ║
    ║ ────────────────────           ║
    ║ TOTAL: ${total:<15}        ║
    ║                                ║
    ║ "I'm never gonna financially   ║
    ║  recover from this"            ║
    ║        - Tiger King            ║
    ╚════════════════════════════════╝
    """
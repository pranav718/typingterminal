#!/bin/bash

# download script for TypingTerminal EPUB books

OUTPUT_DIR="public/sample-books"
mkdir -p "$OUTPUT_DIR"

echo "📚 Downloading 20 classic books to $OUTPUT_DIR..."
echo ""

# function to download with progress
download_book() {
    local url="$1"
    local filename="$2"
    local title="$3"
    
    if [ -f "$OUTPUT_DIR/$filename" ]; then
        echo "⏭️  Skipping $title (already exists)"
    else
        echo "Downloading: $title"
        curl -L -o "$OUTPUT_DIR/$filename" "$url" --progress-bar
        echo "Saved as: $filename"
    fi
    echo ""
}

# standard ebooks downloads
download_book "https://standardebooks.org/ebooks/leo-tolstoy/anna-karenina/constance-garnett/downloads/leo-tolstoy_anna-karenina_constance-garnett.epub" \
    "anna-karenina.epub" "Anna Karenina - Leo Tolstoy"

download_book "https://standardebooks.org/ebooks/fyodor-dostoevsky/crime-and-punishment/constance-garnett/downloads/fyodor-dostoevsky_crime-and-punishment_constance-garnett.epub" \
    "crime-and-punishment.epub" "Crime and Punishment - Fyodor Dostoevsky"

download_book "https://standardebooks.org/ebooks/fyodor-dostoevsky/the-brothers-karamazov/constance-garnett/downloads/fyodor-dostoevsky_the-brothers-karamazov_constance-garnett.epub" \
    "brothers-karamazov.epub" "The Brothers Karamazov - Fyodor Dostoevsky"

download_book "https://standardebooks.org/ebooks/fyodor-dostoevsky/the-idiot/eva-martin/downloads/fyodor-dostoevsky_the-idiot_eva-martin.epub" \
    "the-idiot.epub" "The Idiot - Fyodor Dostoevsky"

download_book "https://standardebooks.org/ebooks/gustave-flaubert/madame-bovary/eleanor-marx-aveling/downloads/gustave-flaubert_madame-bovary_eleanor-marx-aveling.epub" \
    "madame-bovary.epub" "Madame Bovary - Gustave Flaubert"

download_book "https://standardebooks.org/ebooks/jane-austen/emma/downloads/jane-austen_emma.epub" \
    "emma.epub" "Emma - Jane Austen"

download_book "https://standardebooks.org/ebooks/jane-austen/northanger-abbey/downloads/jane-austen_northanger-abbey.epub" \
    "northanger-abbey.epub" "Northanger Abbey - Jane Austen"

download_book "https://standardebooks.org/ebooks/jane-austen/persuasion/downloads/jane-austen_persuasion.epub" \
    "persuasion.epub" "Persuasion - Jane Austen"

download_book "https://standardebooks.org/ebooks/mark-twain/the-adventures-of-tom-sawyer/downloads/mark-twain_the-adventures-of-tom-sawyer.epub" \
    "tom-sawyer.epub" "The Adventures of Tom Sawyer - Mark Twain"

download_book "https://standardebooks.org/ebooks/mark-twain/the-adventures-of-huckleberry-finn/downloads/mark-twain_the-adventures-of-huckleberry-finn.epub" \
    "huckleberry-finn.epub" "Adventures of Huckleberry Finn - Mark Twain"

download_book "https://standardebooks.org/ebooks/robert-louis-stevenson/treasure-island/downloads/robert-louis-stevenson_treasure-island.epub" \
    "treasure-island.epub" "Treasure Island - Robert Louis Stevenson"

download_book "https://standardebooks.org/ebooks/charles-dickens/oliver-twist/downloads/charles-dickens_oliver-twist.epub" \
    "oliver-twist.epub" "Oliver Twist - Charles Dickens"

download_book "https://standardebooks.org/ebooks/charles-dickens/a-tale-of-two-cities/downloads/charles-dickens_a-tale-of-two-cities.epub" \
    "tale-of-two-cities.epub" "A Tale of Two Cities - Charles Dickens"

download_book "https://standardebooks.org/ebooks/jules-verne/around-the-world-in-eighty-days/george-makepeace-towle/downloads/jules-verne_around-the-world-in-eighty-days_george-makepeace-towle.epub" \
    "around-the-world.epub" "Around the World in Eighty Days - Jules Verne"

download_book "https://standardebooks.org/ebooks/h-g-wells/the-war-of-the-worlds/downloads/h-g-wells_the-war-of-the-worlds.epub" \
    "war-of-the-worlds.epub" "The War of the Worlds - H.G. Wells"

download_book "https://standardebooks.org/ebooks/h-g-wells/the-time-machine/downloads/h-g-wells_the-time-machine.epub" \
    "time-machine.epub" "The Time Machine - H.G. Wells"

download_book "https://standardebooks.org/ebooks/joseph-conrad/heart-of-darkness/downloads/joseph-conrad_heart-of-darkness.epub" \
    "heart-of-darkness.epub" "Heart of Darkness - Joseph Conrad"

download_book "https://standardebooks.org/ebooks/nathaniel-hawthorne/the-scarlet-letter/downloads/nathaniel-hawthorne_the-scarlet-letter.epub" \
    "scarlet-letter.epub" "The Scarlet Letter - Nathaniel Hawthorne"

download_book "https://standardebooks.org/ebooks/charles-dickens/great-expectations/downloads/charles-dickens_great-expectations.epub" \
    "great-expectations.epub" "Great Expectations - Charles Dickens"

download_book "https://standardebooks.org/ebooks/jane-austen/sense-and-sensibility/downloads/jane-austen_sense-and-sensibility.epub" \
    "sense-and-sensibility.epub" "Sense and Sensibility - Jane Austen"


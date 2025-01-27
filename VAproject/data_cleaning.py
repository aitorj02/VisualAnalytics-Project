import pandas as pd

# Load the datasets
movies = pd.read_csv('movies.csv')
ratings = pd.read_csv('ratings.csv')
tags = pd.read_csv('tags.csv')

# 1. Clean `movies.csv`
# Extract year from movie titles
movies['year'] = movies['title'].str.extract(r'\((\d{4})\)').astype(float)
movies['title'] = movies['title'].str.replace(r'\(\d{4}\)', '').str.strip()  # Remove year from title

# Split genres into lists
movies['genres'] = movies['genres'].str.split('|')

# 2. Clean `ratings.csv`
# Convert timestamps to datetime
ratings['timestamp'] = pd.to_datetime(ratings['timestamp'], unit='s')

# 3. Clean `tags.csv`
# Convert timestamps to datetime
tags['timestamp'] = pd.to_datetime(tags['timestamp'], unit='s')

# Group tags by movieId and aggregate as a list
tags_agg = tags.groupby('movieId')['tag'].apply(list).reset_index()

# 4. Merge Data
# Merge ratings with movies
data = pd.merge(ratings, movies, on='movieId', how='left')

# Merge the tags into the data
data = pd.merge(data, tags_agg, on='movieId', how='left')

# 5. Aggregate Statistics
# Compute average rating and total ratings per movie
movie_stats = data.groupby('movieId').agg(
    average_rating=('rating', 'mean'),
    total_ratings=('rating', 'count')
).reset_index()

# Merge stats into the dataset
data = pd.merge(data, movie_stats, on='movieId', how='left')

# 6. Save Preprocessed Data
data.to_csv('preprocessed_data.csv', index=False)

# Optional: Save aggregated movie stats for quicker visualizations
movie_stats.to_csv('movie_stats.csv', index=False)

print("Data preprocessing complete. Files saved as 'preprocessed_data.csv' and 'movie_stats.csv'.")

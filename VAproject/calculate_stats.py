import pandas as pd

# Load the CSV file
df = pd.read_csv("movie_stats.csv")

# Calculations
total_movies_rated = len(df)  # Total rows
total_ratings = df["total_ratings"].sum()  # Sum of total_ratings column
average_ratings = (df["average_rating"] * df["total_ratings"]).sum() / total_ratings  # Weighted average

# Results
print(f"Total Movies Rated: {total_movies_rated}")
print(f"Total Ratings: {total_ratings}")
print(f"Average Ratings: {average_ratings:.2f}")

import pandas as pd
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

# Load the data
data = pd.read_csv("movie_stats.csv")

# Standardize the data for PCA
scaler = StandardScaler()
scaled_data = scaler.fit_transform(data[["average_rating", "total_ratings"]])

# Apply PCA
pca = PCA(n_components=2)
pca_result = pca.fit_transform(scaled_data)

# Add PCA results to the original DataFrame
data["PC1"] = pca_result[:, 0]
data["PC2"] = pca_result[:, 1]

# Save the updated dataset
data.to_csv("movie_stats_with_pca.csv", index=False)

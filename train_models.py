# =============================================================================
# STEP 1: Import required libraries
# =============================================================================
# What: We load Python packages that provide data handling, ML algorithms,
#       and visualization tools.
# Why: Just like using a calculator for math, we need these "tools" to load
#      data, build models, and create charts. Without imports, we'd have to
#      write everything from scratch.
# Result: We can use pandas for tables, sklearn for ML, matplotlib for plots, etc.

import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.linear_model import LinearRegression
from sklearn.metrics import accuracy_score, confusion_matrix, mean_squared_error, r2_score
import matplotlib.pyplot as plt

# =============================================================================
# STEP 2: Define the path to the dataset and create output folder
# =============================================================================
# What: We set the file path where our CSV data lives and ensure a folder
#       named "models" exists for saving trained models.
# Why: The script needs to know where to read data from and where to write
#      the .pkl model files. Creating the folder avoids "folder not found" errors.
# Result: DATA_PATH points to our CSV; models/ folder is ready for saving.

DATA_PATH = "megadataset/master_dataset_model_ready.csv"
MODELS_DIR = "models"

# Create models directory if it doesn't exist (e.g. first time running the script)
os.makedirs(MODELS_DIR, exist_ok=True)

# =============================================================================
# STEP 3: Load the dataset from CSV into a DataFrame
# =============================================================================
# What: We read the CSV file and store it in a variable called df (DataFrame).
#       A DataFrame is like a spreadsheet in memory: rows = samples, columns = features/targets.
# Why: All our training happens on this data. We need it in a structure that
#      pandas and sklearn can work with (rows and columns).
# Result: df contains all rows and columns from the CSV; we can inspect df.shape, df.head(), etc.

df = pd.read_csv(DATA_PATH)

# =============================================================================
# STEP 4: Define which columns are targets (what we want to predict)
# =============================================================================
# What: We list the four target column names. These are the "answers" we want
#      our models to predict using the rest of the columns as inputs.
# Why: We must separate "what to predict" from "what to use for prediction"
#      so we can build X (features) and y (targets) correctly.
# Result: We have a clear list: Flood_Occurred, Waterlogging_Occurred,
#         Waterlogging_Days, Flood_Severity_Enc.

TARGET_COLUMNS = [
    "Flood_Occurred",        # 0 or 1: did a flood happen?
    "Waterlogging_Occurred", # 0 or 1: did waterlogging happen?
    "Waterlogging_Days",     # Number: how many days of waterlogging?
    "Flood_Severity_Enc",    # 0,1,2,3: encoded severity (e.g. low to high risk)
]

# =============================================================================
# STEP 5: Build the feature matrix X (all columns except targets)
# =============================================================================
# What: We create X by dropping the four target columns. So X contains only
#      the input features (rainfall, soil, elevation, drainage, etc.) that
#      we will use to predict the targets.
# Why: In supervised learning, the model learns: given X, predict y. So X
#      must not contain the answers (targets); otherwise we'd be "cheating."
# Result: X is a DataFrame with only feature columns; same number of rows as df.

X = df.drop(columns=TARGET_COLUMNS)

# =============================================================================
# STEP 6: Handle any missing values in features
# =============================================================================
# What: We fill missing values (NaN) in X with the median of each column.
#      Median = middle value; it's robust to extreme values compared to mean.
# Why: Most ML algorithms cannot handle NaN. Filling with median keeps the
#      distribution reasonable and avoids dropping too many rows.
# Result: X has no missing values; we can safely use it for training.

X = X.fillna(X.median())

# =============================================================================
# STEP 7: Extract each target series for training different models
# =============================================================================
# What: We pull out each target column from the DataFrame into separate
#      variables (y_flood, y_waterlogging, y_waterlogging_days, y_severity).
# Why: Each model predicts one (or one type of) target. Having separate
#      variables makes the code clear and avoids mistakes.
# Result: We have four target arrays, each with one value per row (per sample).

y_flood = df["Flood_Occurred"]
y_waterlogging = df["Waterlogging_Occurred"]
y_waterlogging_days = df["Waterlogging_Days"]
y_severity = df["Flood_Severity_Enc"]

# =============================================================================
# STEP 8: Handle missing values in target columns
# =============================================================================
# What: We drop rows where any of the four targets is missing. We do this
#      for both X and each y so that feature and target rows stay aligned.
# Why: We cannot train or evaluate on missing targets. Dropping those rows
#      gives us a clean dataset with complete feature-target pairs.
# Result: X and all y arrays have the same length with no NaN in targets.

valid_mask = (
    y_flood.notna()
    & y_waterlogging.notna()
    & y_waterlogging_days.notna()
    & y_severity.notna()
)
X = X[valid_mask].reset_index(drop=True)
y_flood = y_flood[valid_mask].reset_index(drop=True)
y_waterlogging = y_waterlogging[valid_mask].reset_index(drop=True)
y_waterlogging_days = y_waterlogging_days[valid_mask].reset_index(drop=True)
y_severity = y_severity[valid_mask].reset_index(drop=True)

# =============================================================================
# STEP 9: Convert severity to integer type for classification
# =============================================================================
# What: We convert Flood_Severity_Enc to integers (0, 1, 2, 3). Sometimes
#      CSV loading gives floats (e.g. 1.0); classifiers expect integer labels.
# Why: Random Forest for severity expects discrete class labels; integers
#      avoid float comparison issues and make confusion matrix labels clean.
# Result: y_severity is an integer array suitable for multi-class classification.

y_severity = y_severity.astype(int)

# =============================================================================
# STEP 10: Train/test split (80% train, 20% test) with fixed random state
# =============================================================================
# What: We split X and each y into train and test sets. 80% of rows go to
#      training (model learns from these), 20% to test (we evaluate on these
#      unseen data to see how well the model generalizes).
# Why: If we evaluated on the same data we trained on, we'd overestimate
#      performance. The test set simulates "new" data the model has never seen.
# Result: We get X_train, X_test and corresponding y_*_train, y_*_test for
#         each target. random_state=42 makes the split reproducible.

X_train, X_test, y_flood_train, y_flood_test = train_test_split(
    X, y_flood, test_size=0.2, random_state=42
)
_, _, y_waterlogging_train, y_waterlogging_test = train_test_split(
    X, y_waterlogging, test_size=0.2, random_state=42
)
_, _, y_waterlogging_days_train, y_waterlogging_days_test = train_test_split(
    X, y_waterlogging_days, test_size=0.2, random_state=42
)
_, _, y_severity_train, y_severity_test = train_test_split(
    X, y_severity, test_size=0.2, random_state=42
)

# =============================================================================
# STEP 11: Train Random Forest for flood classification (Flood_Occurred 0/1)
# =============================================================================
# What: We create a Random Forest classifier and fit it on X_train and
#      y_flood_train. The model learns to predict 0 (no flood) or 1 (flood).
# Why: Random Forest is good for classification: it builds many decision
#      trees and votes; it handles many features and doesn't need scaling.
# Result: rf_flood is a trained model that can predict flood occurrence.

rf_flood = RandomForestClassifier(n_estimators=100, random_state=42)
rf_flood.fit(X_train, y_flood_train)

# =============================================================================
# STEP 12: Train Random Forest for waterlogging classification (0/1)
# =============================================================================
# What: Same as above, but the target is Waterlogging_Occurred. We fit
#      another Random Forest on (X_train, y_waterlogging_train).
# Why: Waterlogging is a different outcome than flood; it needs its own
#      model to learn the relationship between features and waterlogging.
# Result: rf_waterlogging is a trained model that predicts waterlogging occurrence.

rf_waterlogging = RandomForestClassifier(n_estimators=100, random_state=42)
rf_waterlogging.fit(X_train, y_waterlogging_train)

# =============================================================================
# STEP 13: Train Random Forest for flood severity (0,1,2,3 - risk levels)
# =============================================================================
# What: We train a third Random Forest to predict Flood_Severity_Enc (four
#      classes: 0, 1, 2, 3, which can represent low to high risk).
# Why: Severity is multi-class classification; Random Forest handles this
#      natively by voting across trees for one of the four labels.
# Result: rf_severity is a trained model that predicts severity class.

rf_severity = RandomForestClassifier(n_estimators=100, random_state=42)
rf_severity.fit(X_train, y_severity_train)

# =============================================================================
# STEP 14: Train Logistic Regression for flood probability (0 to 1)
# =============================================================================
# What: We train Logistic Regression on flood occurrence. This model outputs
#      a probability (between 0 and 1) that a flood occurred, not just 0/1.
# Why: Sometimes we need "how likely?" rather than "yes/no". Probability
#      scores help rank risk and set thresholds (e.g. alert if P > 0.7).
# Result: lr_flood is a trained model; we use .predict_proba() to get scores.

lr_flood = LogisticRegression(max_iter=1000, random_state=42)
lr_flood.fit(X_train, y_flood_train)

# =============================================================================
# STEP 15: Train Linear Regression for number of waterlogging days
# =============================================================================
# What: We train Linear Regression to predict Waterlogging_Days (a continuous
#      number). The model learns a linear combination of features to predict days.
# Why: Waterlogging_Days is a numeric outcome (regression), not a category.
#      Linear Regression is a simple, interpretable choice for regression.
# Result: lr_waterlogging_days is a trained model that predicts a real number.

lr_waterlogging_days = LinearRegression()
lr_waterlogging_days.fit(X_train, y_waterlogging_days_train)

# =============================================================================
# STEP 16: Predict on test set for flood (Random Forest)
# =============================================================================
# What: We use the trained Random Forest flood model to predict 0/1 for each
#      row in X_test. These are the model's "guesses" for the test set.
# Why: To compute accuracy and confusion matrix, we need predictions to
#      compare against the true labels (y_flood_test).
# Result: y_flood_pred_rf is an array of 0s and 1s, same length as X_test.

y_flood_pred_rf = rf_flood.predict(X_test)

# =============================================================================
# STEP 17: Predict on test set for waterlogging (Random Forest)
# =============================================================================
# What: Same as step 16 but for the waterlogging Random Forest model.
# Why: We need predictions on the test set to evaluate waterlogging classification.
# Result: y_waterlogging_pred is an array of 0s and 1s for waterlogging.

y_waterlogging_pred = rf_waterlogging.predict(X_test)

# =============================================================================
# STEP 18: Predict on test set for severity (Random Forest)
# =============================================================================
# What: We predict severity class (0, 1, 2, 3) for each test sample using
#      the severity Random Forest model.
# Why: Required to compute accuracy and (if needed) confusion matrix for severity.
# Result: y_severity_pred is an array of severity labels.

y_severity_pred = rf_severity.predict(X_test)

# =============================================================================
# STEP 19: Predict flood probability with Logistic Regression
# =============================================================================
# What: We use predict_proba to get the probability of class 1 (flood) for
#      each test sample. We take the second column [:, 1] which is P(flood).
# Why: Logistic Regression gives probabilities; we use them for scoring and
#      for the confusion matrix when we convert to 0/1 with a threshold (e.g. 0.5).
# Result: y_flood_prob_lr is an array of probabilities between 0 and 1.

y_flood_prob_lr = lr_flood.predict_proba(X_test)[:, 1]

# =============================================================================
# STEP 20: Convert probability to class (0/1) for Logistic Regression
# =============================================================================
# What: We turn probabilities into class labels: if probability >= 0.5 we
#      say "flood" (1), otherwise "no flood" (0). This is the usual threshold.
# Why: Confusion matrix and accuracy need discrete predictions (0 or 1), not
#      probabilities. Using 0.5 is the standard default.
# Result: y_flood_pred_lr is an array of 0s and 1s for Logistic Regression.

y_flood_pred_lr = (y_flood_prob_lr >= 0.5).astype(int)

# =============================================================================
# STEP 21: Predict waterlogging days with Linear Regression
# =============================================================================
# What: We use the trained Linear Regression model to predict the number of
#      waterlogging days for each test sample. Output can be any real number.
# Why: This is the regression model's output; we'll compare to actual days
#      using MSE and R².
# Result: y_waterlogging_days_pred is an array of predicted days (may be float).

y_waterlogging_days_pred = lr_waterlogging_days.predict(X_test)

# =============================================================================
# STEP 22: Compute and print accuracy for all classifiers
# =============================================================================
# What: Accuracy = (number of correct predictions) / (total predictions).
#      We compute this for: RF flood, RF waterlogging, RF severity, LR flood.
# Why: Accuracy is the most intuitive metric: "What fraction of test samples
#      did we get right?" We print it so we can see performance at a glance.
# Result: Printed accuracy scores for each classification model.

acc_rf_flood = accuracy_score(y_flood_test, y_flood_pred_rf)
acc_rf_waterlogging = accuracy_score(y_waterlogging_test, y_waterlogging_pred)
acc_rf_severity = accuracy_score(y_severity_test, y_severity_pred)
acc_lr_flood = accuracy_score(y_flood_test, y_flood_pred_lr)

print("=" * 60)
print("ACCURACY SCORES")
print("=" * 60)
print(f"Random Forest - Flood classification:        {acc_rf_flood:.4f}")
print(f"Random Forest - Waterlogging classification: {acc_rf_waterlogging:.4f}")
print(f"Random Forest - Flood severity:              {acc_rf_severity:.4f}")
print(f"Logistic Regression - Flood classification: {acc_lr_flood:.4f}")
print()

# =============================================================================
# STEP 23: Compute R² and RMSE for Linear Regression (waterlogging days)
# =============================================================================
# What: R² (R-squared) measures how much variance in the target is explained
#      by the model (0 to 1, higher is better). RMSE is root mean squared
#      error: average error in "days" units; lower is better.
# Why: For regression we care about prediction error and explanatory power,
#      not accuracy (which is for classification).
# Result: We get one R² and one RMSE value; we print them.

r2_waterlogging_days = r2_score(y_waterlogging_days_test, y_waterlogging_days_pred)
rmse_waterlogging_days = np.sqrt(
    mean_squared_error(y_waterlogging_days_test, y_waterlogging_days_pred)
)
print("LINEAR REGRESSION - Waterlogging Days")
print("-" * 60)
print(f"R² score:  {r2_waterlogging_days:.4f}")
print(f"RMSE:      {rmse_waterlogging_days:.4f} days")
print()

# =============================================================================
# STEP 24: Build and display confusion matrix for Random Forest flood model
# =============================================================================
# What: A confusion matrix is a 2x2 table: rows = true class, columns =
#      predicted class. It shows true positives, false positives, true
#      negatives, false negatives. We plot it as a heatmap.
# Why: Accuracy alone can hide where the model fails (e.g. missing floods).
#      The matrix shows exactly which mistakes the model makes.
# Result: A heatmap plot for RF flood predictions; we save it and show it.

cm_rf_flood = confusion_matrix(y_flood_test, y_flood_pred_rf)
fig, ax = plt.subplots(figsize=(6, 5))
im = ax.imshow(cm_rf_flood, interpolation="nearest", cmap=plt.cm.Blues)
ax.figure.colorbar(im, ax=ax)
ax.set_xticks([0, 1])
ax.set_yticks([0, 1])
ax.set_xticklabels(["No Flood", "Flood"])
ax.set_yticklabels(["No Flood", "Flood"])
ax.set_xlabel("Predicted")
ax.set_ylabel("Actual")
ax.set_title("Confusion Matrix - Random Forest (Flood Classification)")

for i in range(cm_rf_flood.shape[0]):
    for j in range(cm_rf_flood.shape[1]):
        ax.text(j, i, format(cm_rf_flood[i, j], "d"),
                ha="center", va="center", color="black")

plt.tight_layout()
plt.savefig(os.path.join(MODELS_DIR, "confusion_matrix_rf_flood.png"), dpi=150)
plt.close()
print("Saved: models/confusion_matrix_rf_flood.png")

# =============================================================================
# STEP 25: Build and display confusion matrix for Logistic Regression flood
# =============================================================================
# What: Same as step 24 but for Logistic Regression flood predictions. We
#      compare predicted vs actual flood labels.
# Why: To see how Logistic Regression performs in terms of correct/incorrect
#      classifications and to compare with Random Forest.
# Result: A second heatmap for LR flood; saved as PNG.

cm_lr_flood = confusion_matrix(y_flood_test, y_flood_pred_lr)
fig, ax = plt.subplots(figsize=(6, 5))
im = ax.imshow(cm_lr_flood, interpolation="nearest", cmap=plt.cm.Greens)
ax.figure.colorbar(im, ax=ax)
ax.set_xticks([0, 1])
ax.set_yticks([0, 1])
ax.set_xticklabels(["No Flood", "Flood"])
ax.set_yticklabels(["No Flood", "Flood"])
ax.set_xlabel("Predicted")
ax.set_ylabel("Actual")
ax.set_title("Confusion Matrix - Logistic Regression (Flood Classification)")

for i in range(cm_lr_flood.shape[0]):
    for j in range(cm_lr_flood.shape[1]):
        ax.text(j, i, format(cm_lr_flood[i, j], "d"),
                ha="center", va="center", color="black")

plt.tight_layout()
plt.savefig(os.path.join(MODELS_DIR, "confusion_matrix_lr_flood.png"), dpi=150)
plt.close()
print("Saved: models/confusion_matrix_lr_flood.png")

# =============================================================================
# STEP 26: Optional - confusion matrix for Random Forest waterlogging
# =============================================================================
# What: We create a confusion matrix for the waterlogging Random Forest
#      (2x2: no waterlogging vs waterlogging).
# Why: To see where the waterlogging classifier makes mistakes.
# Result: Third heatmap saved for RF waterlogging.

cm_rf_waterlogging = confusion_matrix(y_waterlogging_test, y_waterlogging_pred)
fig, ax = plt.subplots(figsize=(6, 5))
im = ax.imshow(cm_rf_waterlogging, interpolation="nearest", cmap=plt.cm.Oranges)
ax.figure.colorbar(im, ax=ax)
ax.set_xticks([0, 1])
ax.set_yticks([0, 1])
ax.set_xticklabels(["No Waterlogging", "Waterlogging"])
ax.set_yticklabels(["No Waterlogging", "Waterlogging"])
ax.set_xlabel("Predicted")
ax.set_ylabel("Actual")
ax.set_title("Confusion Matrix - Random Forest (Waterlogging Classification)")

for i in range(cm_rf_waterlogging.shape[0]):
    for j in range(cm_rf_waterlogging.shape[1]):
        ax.text(j, i, format(cm_rf_waterlogging[i, j], "d"),
                ha="center", va="center", color="black")

plt.tight_layout()
plt.savefig(os.path.join(MODELS_DIR, "confusion_matrix_rf_waterlogging.png"), dpi=150)
plt.close()
print("Saved: models/confusion_matrix_rf_waterlogging.png")

# =============================================================================
# STEP 27: Get feature importances from Random Forest (flood model)
# =============================================================================
# What: Random Forest provides feature_importances_: each feature gets a
#      score showing how much it contributed to predictions (sum to 1).
# Why: We want to know which inputs (rainfall, soil, drainage, etc.) matter
#      most for flood prediction. This helps interpret and simplify the model.
# Result: We have an array of importance values and the list of feature names.

importances = rf_flood.feature_importances_
feature_names = X.columns.tolist()

# =============================================================================
# STEP 28: Sort features by importance and take top N for the chart
# =============================================================================
# What: We sort (feature_name, importance) pairs by importance descending
#      and take the top 20 so the chart stays readable.
# Why: Datasets with many features would make a full chart too crowded. Top
#      20 shows the most influential features clearly.
# Result: Two lists: sorted names and sorted importances (top 20).

indices = np.argsort(importances)[::-1][:20]
top_names = [feature_names[i] for i in indices]
top_importances = importances[indices]

# =============================================================================
# STEP 29: Plot feature importance as horizontal bar chart
# =============================================================================
# What: We create a horizontal bar chart: each bar is one feature, length =
#      its importance. Features are ordered from most to least important.
# Why: Visualizing importance makes it easy to see which factors drive
#      flood prediction (e.g. rainfall, drainage, elevation).
# Result: A PNG file saved in models/ and the figure closed to free memory.

fig, ax = plt.subplots(figsize=(10, 8))
ax.barh(range(len(top_names)), top_importances, color="steelblue", alpha=0.8)
ax.set_yticks(range(len(top_names)))
ax.set_yticklabels(top_names, fontsize=9)
ax.invert_yaxis()
ax.set_xlabel("Feature importance")
ax.set_ylabel("Feature")
ax.set_title("Random Forest - Top 20 Feature Importances (Flood Classification)")
plt.tight_layout()
plt.savefig(os.path.join(MODELS_DIR, "feature_importance_rf_flood.png"), dpi=150)
plt.close()
print("Saved: models/feature_importance_rf_flood.png")

# =============================================================================
# STEP 30: Save all trained models as .pkl files
# =============================================================================
# What: We use joblib.dump to serialize each trained model (Random Forests,
#      Logistic Regression, Linear Regression) to a .pkl file in models/.
# Why: Training can take time. Saving models lets us load them later for
#      predictions without retraining (e.g. in a web app or batch script).
# Result: Six .pkl files in the models/ folder: one per trained model.

joblib.dump(rf_flood, os.path.join(MODELS_DIR, "rf_flood.pkl"))
joblib.dump(rf_waterlogging, os.path.join(MODELS_DIR, "rf_waterlogging.pkl"))
joblib.dump(rf_severity, os.path.join(MODELS_DIR, "rf_severity.pkl"))
joblib.dump(lr_flood, os.path.join(MODELS_DIR, "lr_flood_probability.pkl"))
joblib.dump(lr_waterlogging_days, os.path.join(MODELS_DIR, "lr_waterlogging_days.pkl"))

# =============================================================================
# STEP 31: Save feature names and target info for use during prediction
# =============================================================================
# What: We save the list of feature column names (and optionally target names)
#      so that when we load a model later we know which columns to pass and
#      in what order. We pack them in a small dict and save as .pkl.
# Why: Prediction scripts need to build the same X columns as training.
#      Saving feature names avoids hardcoding and keeps train/predict in sync.
# Result: A metadata .pkl file that prediction code can load to get feature list.

meta = {
    "feature_names": feature_names,
    "target_columns": TARGET_COLUMNS,
}
joblib.dump(meta, os.path.join(MODELS_DIR, "metadata.pkl"))

print()
print("Saved models:")
print("  - models/rf_flood.pkl")
print("  - models/rf_waterlogging.pkl")
print("  - models/rf_severity.pkl")
print("  - models/lr_flood_probability.pkl")
print("  - models/lr_waterlogging_days.pkl")
print("  - models/metadata.pkl")
print()
print("Training complete.")

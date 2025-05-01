# crop_recommender.py - Updated with explicit Soil Moisture input
import sys
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import numpy as np



# --- Data Loading and Model Training ---
def load_data_and_train():
    df = pd.read_csv(sys.argv[1])

    df = df.rename(columns={
        'Nitrogen': 'N',
        'Phosphorus': 'P',
        'Potassium': 'K',
        'pH_Value': 'pH',
        'Soil_Moisture': 'Soil_Moisture'  # Ensure this column is in the CSV
    })

    le = LabelEncoder()
    df['Crop'] = le.fit_transform(df['Crop'])
    model = RandomForestClassifier()
    model.fit(df.drop(['Crop', 'Rainfall'], axis=1), df['Crop'])  # Exclude Rainfall during model training

    crop_stats = {}
    for crop in le.classes_:
        crop_data = df[df['Crop'] == le.transform([crop])[0]]
        stats = {
            'N_avg': np.mean(crop_data['N']),
            'P_avg': np.mean(crop_data['P']),
            'K_avg': np.mean(crop_data['K']),
            'Temperature': (np.min(crop_data['Temperature']), np.max(crop_data['Temperature'])),
            'Humidity': (np.min(crop_data['Humidity']), np.max(crop_data['Humidity'])),
            'pH': (np.min(crop_data['pH']), np.max(crop_data['pH'])),
            'Soil_Moisture': (np.min(crop_data['Soil_Moisture']), np.max(crop_data['Soil_Moisture']))
        }
        crop_stats[crop] = stats

    return model, le, crop_stats

model, le, crop_stats = load_data_and_train()
all_crops = sorted(le.classes_)


#get selected_crop from frontend request passed as an argument

avg_n = round(crop_stats["Apple"]['N_avg'], 1)
avg_p = round(crop_stats["Apple"]['P_avg'], 1)
avg_k = round(crop_stats["Apple"]['K_avg'], 1)

# --- Analysis Logic ---
#here get data from sensor
analysis_data = {
        'N': avg_n,
        'P': avg_p,
        'K': avg_k,
        'Temperature': 0,
        'Humidity': 0,
        'pH': 0,
        'Soil_Moisture': 0
    }

#here1, get selected crop from frontend
requirements = crop_stats["Apple"]
violations = []
for param in ['Temperature', 'Humidity', 'pH', 'Soil_Moisture']:  # Removed Rainfall
        min_val, max_val = requirements[param]
        if not (min_val <= analysis_data[param] <= max_val):
            violations.append(f"{param}: {analysis_data[param]} (requires {min_val}-{max_val})")

    # Alternative crops
    #here
suitable_crops = []
for crop in all_crops:
        reqs = crop_stats[crop]
        if all(
            reqs[param][0] <= analysis_data[param] <= reqs[param][1]
            for param in ['Temperature', 'Humidity', 'pH', 'Soil_Moisture']  # Removed Rainfall
        ):
            suitable_crops.append((crop, reqs['N_avg'], reqs['P_avg'], reqs['K_avg']))


# --- Crop Requirement Table ---
summary_data = []
i = 0
for crop in all_crops:
        
        stats = crop_stats[crop]
        summary_data.append({
            "id": i,
            "Crop": crop,
            "Avg NPK": f"N: {stats['N_avg']:.1f} - P: {stats['P_avg']:.1f}- K: {stats['K_avg']:.1f}",
            "Temp(C)": f"{stats['Temperature'][0]} - {stats['Temperature'][1]}",
            "Humidity(%)": f"{stats['Humidity'][0]} - {stats['Humidity'][1]}",
            "pH Range": f"{stats['pH'][0]} - {stats['pH'][1]}",
            "Soil Moisture(%)": f"{stats['Soil_Moisture'][0]} - {stats['Soil_Moisture'][1]}"
        })
        i += 1


print(summary_data[10])




# Health Application ER Diagram

This diagram shows the relationships between entities in our health tracking application.

## PlantUML Notation

```plantuml
@startuml Health Application ER Diagram

' Entity definitions
entity User {
  * id : string
  * email : string
  * name : string
  --
  height : number
  weight : number
  goal : string
  avatar : string
  age : number
  gender : string
  bloodType : string
  emergencyContact : string
  medicalConditions : string[]
  allergies : string[]
}

entity WorkoutLog {
  * id : string
  * type : string
  * duration : number
  * calories : number
  * date : string
  --
  intensity : enum
  notes : string
}

entity WaterLog {
  * id : string
  * amount : number
  * timestamp : string
}

entity MealLog {
  * id : string
  * name : string
  * calories : number
  * protein : number
  * carbs : number
  * fat : number
  * timestamp : string
  * type : enum
}

entity SleepLog {
  * id : string
  * start : string
  * end : string
  * duration : number
  * quality : enum
  --
  notes : string
}

entity VitalLog {
  * id : string
  * type : enum
  * value : string|number
  * timestamp : string
  --
  notes : string
}

entity MedicationLog {
  * id : string
  * name : string
  * dosage : string
  * time : string
  * taken : boolean
}

entity MoodLog {
  * id : string
  * mood : enum
  * timestamp : string
  --
  notes : string
}

entity HealthGoal {
  * id : string
  * name : string
  * target : number
  * current : number
  * unit : string
  * category : enum
  --
  deadline : string
}

entity UserSettings {
  * theme : enum
  * notifications : boolean
  * units : enum
  * privacyLevel : enum
  * language : string
}

' Relationships
User "1" -- "0..*" WorkoutLog : logs
User "1" -- "0..*" WaterLog : logs
User "1" -- "0..*" MealLog : logs
User "1" -- "0..*" SleepLog : logs
User "1" -- "0..*" VitalLog : logs
User "1" -- "0..*" MedicationLog : logs
User "1" -- "0..*" MoodLog : logs
User "1" -- "0..*" HealthGoal : sets
User "1" -- "1" UserSettings : has

@enduml
```

## Mermaid Notation

```mermaid
erDiagram
    User ||--o{ WorkoutLog : logs
    User ||--o{ WaterLog : logs
    User ||--o{ MealLog : logs
    User ||--o{ SleepLog : logs
    User ||--o{ VitalLog : logs
    User ||--o{ MedicationLog : logs
    User ||--o{ MoodLog : logs
    User ||--o{ HealthGoal : sets
    User ||--|| UserSettings : has
    
    User {
        string id PK
        string email
        string name
        number height
        number weight
        string goal
        string avatar
        number age
        string gender
        string bloodType
        string emergencyContact
        string[] medicalConditions
        string[] allergies
    }
    
    WorkoutLog {
        string id PK
        string type
        number duration
        number calories
        string date
        enum intensity
        string notes
    }
    
    WaterLog {
        string id PK
        number amount
        string timestamp
    }
    
    MealLog {
        string id PK
        string name
        number calories
        number protein
        number carbs
        number fat
        string timestamp
        enum type
    }
    
    SleepLog {
        string id PK
        string start
        string end
        number duration
        enum quality
        string notes
    }
    
    VitalLog {
        string id PK
        enum type
        string value
        string timestamp
        string notes
    }
    
    MedicationLog {
        string id PK
        string name
        string dosage
        string time
        boolean taken
    }
    
    MoodLog {
        string id PK
        enum mood
        string timestamp
        string notes
    }
    
    HealthGoal {
        string id PK
        string name
        number target
        number current
        string unit
        string deadline
        enum category
    }
    
    UserSettings {
        enum theme
        boolean notifications
        enum units
        enum privacyLevel
        string language
    }
```

## Entity Descriptions

### User
The central entity that represents a user of the application. This includes basic profile information as well as health-related attributes.

### WorkoutLog
Records of workout sessions performed by the user, including type, duration, and calories burned.

### WaterLog
Tracks water intake by amount and timestamp.

### MealLog
Stores information about meals consumed, including nutritional information.

### SleepLog
Records sleep sessions with start and end times, duration, and quality rating.

### VitalLog
Stores vital sign measurements like blood pressure, heart rate, etc.

### MedicationLog
Tracks medications, dosages, and whether they were taken.

### MoodLog
Records the user's mood at various points in time.

### HealthGoal
Represents health-related goals set by the user, with target and current values.

### UserSettings
Stores user preferences for the application.

## Relationships

- A User can have multiple WorkoutLogs, WaterLogs, MealLogs, SleepLogs, VitalLogs, MedicationLogs, MoodLogs, and HealthGoals.
- A User has exactly one UserSettings record.
- All logs and goals belong to exactly one User.

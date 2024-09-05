-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "fullName" TEXT,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "image" TEXT,
    "username" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'GUEST',
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "contactAddress" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "lga" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "height" REAL,
    "dateOfBirth" DATETIME,
    "occupation" TEXT,
    "aboutMe" TEXT,
    "socialMediaHandlesId" INTEGER,
    "ipAddress" TEXT,
    "gps" TEXT,
    "deviceInfo" TEXT,
    "lastLogin" DATETIME,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_socialMediaHandlesId_fkey" FOREIGN KEY ("socialMediaHandlesId") REFERENCES "SocialMediaHandles" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_User" ("aboutMe", "active", "contactAddress", "country", "createdAt", "dateOfBirth", "deviceInfo", "email", "firstName", "fullName", "gps", "height", "id", "image", "ipAddress", "lastLogin", "lastName", "lga", "middleName", "occupation", "password", "phone", "role", "socialMediaHandlesId", "state", "updatedAt", "username") SELECT "aboutMe", "active", "contactAddress", "country", "createdAt", "dateOfBirth", "deviceInfo", "email", "firstName", "fullName", "gps", "height", "id", "image", "ipAddress", "lastLogin", "lastName", "lga", "middleName", "occupation", "password", "phone", "role", "socialMediaHandlesId", "state", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_socialMediaHandlesId_key" ON "User"("socialMediaHandlesId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

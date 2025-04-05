module.exports = (sequelize, DataTypes) => {
  const photo = sequelize.define(
    "photo",
    {
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isUnsplashUrl(value) {
            if (!value.startsWith("https://images.unsplash.com/")) {
              throw new Error("Invalid image URL. Only unsplash are allowed.");
            }
          },
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      altDescription: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      dateSaved: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "User", key: "id" },
        allowNull: false,
        onDelete: "CASCADE",
      },
    },
    {
      timestamps: true,
      tableName: "photos",
    }
  );

  // Associations
  photo.associate = (models) => {
    photo.hasMany(models.tag, { foreignKey: "photoId", onDelete: "CASCADE" });
  };
  return photo;
};

module.exports = (sequelize, DataTypes) => {
  const searchHistory = sequelize.define(
    "searchHistory",
    {
      query: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Search query cannot be empty.",
          },
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "User", key: "id" },
        allowNull: false,
        validate: {
          isInt: { msg: "User ID must be and integer." },
        },
      },
      timestamp: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      timestamps: true,
    }
  );

  return searchHistory;
};

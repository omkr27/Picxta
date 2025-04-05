module.exports = (sequelize, DataTypes) => {
  const tag = sequelize.define(
    "tag",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Tag name cannot be empty",
          },
        },
      },
      photoId: {
        type: DataTypes.INTEGER,
        references: { model: "photo", key: "id" },
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  tag.associate = (models) => {
    tag.belongsTo(models.photo, { foreignKey: "photoId", onDelete: "CASCADE" });
  };

  return tag;
};

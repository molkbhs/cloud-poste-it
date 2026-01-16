const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Note = sequelize.define('Note', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Sans titre'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: ''
    },
    color: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '#FFD700',
      validate: {
        isIn: [['#FFD700', '#FFB6C1', '#87CEEB', '#90EE90', '#FFE4B5', '#DDA0DD', '#F0E68C', '#FFA07A']]
      }
    },
    x: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50
    },
    y: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'URL de l\'image stockée sur S3'
    },
    imageKey: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Clé S3 pour identifier le fichier'
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'default',
      index: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'notes',
    timestamps: true,
    indexes: [
      {
        fields: ['userId', 'createdAt']
      },
      {
        fields: ['id']
      }
    ]
  });

  return Note;
};

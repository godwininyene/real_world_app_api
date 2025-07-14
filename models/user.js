"use strict";
const { Model } = require("sequelize");
const bcrypt = require('bcryptjs')
const crypto = require('crypto');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // Define associations (virtuals in Mongoose)
      User.hasOne(models.Wallet, { foreignKey: "userId", as:'wallet' });
      User.hasMany(models.BankAccount, { foreignKey: "userId", as: 'bankAccounts' });
      User.hasMany(models.Transaction, { foreignKey: 'userId', as: 'transactions' });
    }

    async correctPassword(candidatePassword, userPassword){
      return await bcrypt.compare(candidatePassword, userPassword)
    }

    createPasswordResetToken = function(){
      const resetToken = crypto.randomBytes(32).toString("hex");
      this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
      this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
      return resetToken;
    }

    changedPasswordAfter(JWTtime){
      //User has change password
      if (this.passwordChangedAt) {
        const changeTimeStamp = new Date(this.passwordChangedAt).getTime() / 1000;
        return changeTimeStamp > JWTtime;
      }
      return false; // User has not changed password
    }

  }
  User.init(
    {
     firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Please provide your firstname' },
        notEmpty: { msg: 'firstname Cannot be empty' }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Please provide your lastname' },
        notEmpty: { msg: 'lastname Cannot be empty' }
      }
    },

    username: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Please provide your username' },
        notEmpty: { msg: 'username Cannot be empty' }
      },
      unique:true
    },
    email: {
      type:DataTypes.STRING,
      allowNull:false,
      validate: {
        notNull: { msg: 'Please provide your email address' },
        notEmpty:{msg:'Email cannot be empty'},
        isEmail: { msg: 'Please provide a valid email address' }
      },
      unique:true
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      unique:true,
      validate: {
        is: {
          args: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im,
          msg: 'Please provide a valid phone number'
        },
        notNull: { msg: 'Please provide primary phone number' },
        notEmpty: { msg: 'Primary phone number cannot be empty' }
      }
    },
    photo: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      allowNull: false,
      defaultValue: 'user',
      validate: {
        isIn: {
          args: [['admin', 'user']],
          msg: 'Invalid user role'
        }
      }
    },
    status: {
      type: DataTypes.ENUM('active', 'pending', 'denied', 'deactivated'),
      allowNull: false,
      defaultValue: 'active',
      validate: {
        isIn: {
          args: [['active', 'pending', 'denied', 'deactivated']],
          msg: 'Invalid user status'
        }
      }
    },
      
    accountId: {
      type: DataTypes.STRING,
      defaultValue: `trw-${Date.now()}`,
    },
    referralId: DataTypes.STRING,
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { msg: 'Please provide your password' },
        notEmpty: { msg: 'Password Cannot be empty' },
        len: {
          args: [8, 100],
          msg: 'Password must be at least 8 characters long'
        }
      }
    },
    passwordConfirm: {
      type: DataTypes.VIRTUAL,
      allowNull: false, 
      validate: {
        notNull: { msg: 'Please confirm your password' },
        isMatch(value) {
          if (value !== this.password) {
            throw new Error('The password confirmation does not match');
          }
        }
      }
    },
    passwordChangedAt: {
      type: DataTypes.DATE
    },
    passwordResetToken:DataTypes.STRING,
    passwordResetExpires: {
      type: DataTypes.DATE
    }

  },
  {
    sequelize,
    modelName: "User",
    tableName:'users',
    hooks:{
      beforeSave: async (user) => {
        // 1. Hash password if it's new or changed
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 12);
          // // 2. Set passwordChangedAt only when updating existing users
          if (!user.isNewRecord) {
            user.passwordChangedAt = Date.now() - 1000;
          }
        }
      },
    },
     // Exclude password by default in queries
    defaultScope: {
      attributes: { exclude: ['password'] }
    },
    // Custom scopes (e.g.,To include password in specific queries)
    scopes: {
      withPassword: {
        attributes: { include: ['password'] }
      }
    },
  }
  );
  return User;
};
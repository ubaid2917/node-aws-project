const { User } = require("../../models");
const { TEXTS, STATUS_CODES } = require("../../utils/constant");

const register = async (req, res) => {
    try {
      // Convert prototype-less body to a plain object
        const body = Object.assign({}, req.body);
  
      const { name, email, password } = body;
      const profileUrl = req.file?.location || null;
  
      console.log('profile url', profileUrl);  


      const isExistEmail = await User.findOne({
        where : {
          email: email
        }
      })  

      if(isExistEmail) {
        return res.status(STATUS_CODES.CONFLICT).json({
          statusCode: STATUS_CODES.CONFLICT,
          message: TEXTS.USER_EXIST,
        });
      }
  
      const newRecord = await User.create({
        name,
        email,
        password,
        profile: profileUrl,
      });
  
      return res.status(201).json({
        statusCode: 201,
        message: TEXTS.CREATED,
        data: newRecord,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      return res.status(500).json({
        message: "Internal server error",
      });
    }
  };
  

const getMany = async (req, res) => {
  const { count, rows } = await User.findAndCountAll({
    order: [["created", "DESC"]],
  });

  res.status(STATUS_CODES.SUCCESS).json({
    statusCode: STATUS_CODES.SUCCESS,
    message: TEXTS.FOUND,
    data: rows,
    total: count,
  });
};

const getOne = async (req, res) => {
  const userId = req.user.id;

  const id = req.params.id;

  const data = await LuckyBox.findOne({
    where: { id: req.params?.id },
    attributes: [
      "id",
      "perPerson",
      "diamond",
      "totalAmount",
      "created",
      "updated",
      "isOpen",
      "openAt",
      "isEmpty",
    ],
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "picture", "name", "code", "user_name"],
      },
    ],
    order: [["created", "DESC"]],
  });

  res.status(STATUS_CODES.SUCCESS).json({
    statusCode: STATUS_CODES.SUCCESS,
    message: TEXTS.FOUND,
    data: data,
  });
};

const update = async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  const { diamond, perPerson, countDown, roomId, participantCondition } =
    req.body;

  const luckyBoxData = await LuckyBox.findOne({
    where: { id: id },
    raw: true,
  });

  if (!luckyBoxData) {
    return res.status(STATUS_CODES.NOT_FOUND).json({
      statusCode: STATUS_CODES.NOT_FOUND,
      message: "lucky box not found",
    });
  }

  let totalAmount = diamond * perPerson;

  const transaction = await sequelize.transaction();

  if (
    user.role === "Host" &&
    (!participantCondition || participantCondition.trim() === "")
  ) {
    return res.status(400).json({
      statusCode: 400,
      message: "participantCondition is required for Hosts",
    });
  }

  const isExistUserWallet = await Wallet.findOne({
    where: { userId: user?.id },
    transaction,
  });

  if (!isExistUserWallet) {
    await transaction.rollback();
    return res.status(404).json({
      statusCode: 404,
      message: "User Wallet not found",
    });
  }

  const countdownMatch = countDown.match(/\d+/);
  const countdownMinutes = countdownMatch ? parseInt(countdownMatch[0]) : NaN;

  if (isNaN(countdownMinutes)) {
    return res.status(400).json({
      statusCode: 400,
      message: "Invalid countDown format. It must be like '3 min'",
    });
  }

  const now = new Date();
  const futureTime = new Date(now.getTime() + countdownMinutes * 60 * 1000);
  const delay = futureTime - now;

  console.log("future time (UTC):", futureTime.toISOString());
  console.log("Delay (ms):", delay);

  if (isExistUserWallet.diamond < totalAmount) {
    await transaction.rollback();
    return res.status(400).json({
      statusCode: 400,
      message: "Insufficient diamonds in wallet",
    });
  }

  const [affectedRows, updatedRecords] = await LuckyBox.update(
    {
      diamond,
      perPerson,
      countDown,
      roomId,
      participantCondition,
      openAt: futureTime,
      totalAmount: totalAmount,
      remainingAmount: totalAmount,
      countDown: futureTime,
      participantCondition: user.role === "User" ? null : participantCondition,
    },
    { where: { id: id }, returning: true, plain: true }
  );

  return res.status(STATUS_CODES.SUCCESS).json({
    statusCode: STATUS_CODES.SUCCESS,
    message: "Lucky box updated successfully",
    data: updatedRecords,
  });
};

const destroy = async (req, res) => {
  const { id } = req.params;

  const data = await LuckyBox.findByPk(id);

  if (!data) {
    return res.status(STATUS_CODES.NOT_FOUND).json({
      statusCode: STATUS_CODES.NOT_FOUND,
      message: TEXTS.NOT_FOUND,
    });
  }

  await data.destroy();

  return res.status(STATUS_CODES.SUCCESS).json({
    statusCode: STATUS_CODES.SUCCESS,
    message: TEXTS.DELETED,
  });
};

module.exports = {
  register,
  getMany,
  getOne,
  destroy,
  update,
};

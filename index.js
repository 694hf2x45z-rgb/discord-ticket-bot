const {
  Client,
  GatewayIntentBits,
  Partials,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Events,
  ChannelType,
  PermissionsBitField
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ],
  partials: [Partials.Channel]
});

const TOKEN = process.env.TOKEN; // نحطه لاحقاً في Railway

const ADMIN_ROLE_ID = "PUT_ADMIN_ROLE_ID_HERE";
const TICKET_CATEGORY_ID = "PUT_CATEGORY_ID_HERE";

client.once(Events.ClientReady, () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isButton()) return;

  // فتح تكت
  if (interaction.customId === "open_ticket") {
    const channel = await interaction.guild.channels.create({
      name: `ticket-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: TICKET_CATEGORY_ID,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel]
        },
        {
          id: interaction.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
        },
        {
          id: ADMIN_ROLE_ID,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]
        }
      ]
    });

    const closeBtn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("🔒 Close Ticket")
        .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
      content: `🎫 أهلاً ${interaction.user}\nاكتب مشكلتك وسيتم الرد عليك.`,
      components: [closeBtn]
    });

    await interaction.reply({ content: "✅ تم فتح التكت", ephemeral: true });
  }

  // إغلاق تكت
  if (interaction.customId === "close_ticket") {
    await interaction.reply("⏳ سيتم إغلاق التكت...");
    setTimeout(() => interaction.channel.delete(), 3000);
  }
});

// رد تلقائي بسيط
client.on(Events.MessageCreate, message => {
  if (message.author.bot) return;

  if (message.content.includes("السلام")) {
    message.reply("وعليكم السلام 👋 كيف أقدر أساعدك؟");
  }
});

client.login(TOKEN);

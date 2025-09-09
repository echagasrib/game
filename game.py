# Arquivo: bot.py
# Localização: pasta 'bot_python'

import logging
from telegram import Update
from telegram.ext import Application, CommandHandler, ContextTypes

# ======================================================================
#              1. CONFIGURAÇÕES GERAIS E CHAVES
# ======================================================================

# O token do seu bot, fornecido pelo BotFather
TELEGRAM_TOKEN = "8285875885:AAEJnvEA4vfwJuTuD1yKDz_EzK28biIiEFs" # Lembre-se de colocar seu token real

# O nome curto do jogo, exatamente como definido no BotFather
GAME_SHORT_NAME = "Flappybolo" 

# Configuração de logs para ajudar a encontrar erros
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

# ======================================================================
#              2. COMANDOS DO BOT
# ======================================================================

async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Envia uma mensagem de boas-vindas quando o comando /start é emitido."""
    if update.effective_chat:
        await update.message.reply_text(
            "Olá! Sou o bot do jogo Flappy Bolo. Envie /play para começar a jogar!"
        )

async def play_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Envia o jogo para o usuário quando ele digita /play."""
    if update.effective_chat:
        await context.bot.send_game(chat_id=update.effective_chat.id, game_short_name=GAME_SHORT_NAME)
    else:
        logger.warning("O comando /play foi chamado sem um chat efetivo.")

# ======================================================================
#              3. FUNÇÃO PRINCIPAL (MAIN)
# ======================================================================

def main() -> None:
    """Inicia o bot e o mantém rodando."""
    logger.info("Iniciando o bot...")
    
    # Cria a aplicação do bot
    application = Application.builder().token(TELEGRAM_TOKEN).build()

    # Adiciona os handlers (comandos que o bot "ouve")
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("play", play_command))

    # Inicia o bot para receber atualizações do Telegram
    logger.info("Bot iniciado com sucesso. Pressione Ctrl+C para parar.")
    application.run_polling()

if __name__ == "__main__":
    main()
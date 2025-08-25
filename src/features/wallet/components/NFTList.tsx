// src/features/wallet/components/NFTList.tsx
import React from 'react'
import { useI18n } from '@app/providers/I18nProvider'
import { Card } from '@shared/ui/Card'
import { Image } from 'lucide-react'

export const NFTList: React.FC = () => {
  const { t } = useI18n()

  return (
    <div className="text-center py-12">
      <Image className="mx-auto mb-4 text-matte-black-400" size={48} />
      <h3 className="text-lg font-medium mb-2">
        {t('wallet.nfts.no_nfts', 'Nenhum NFT encontrado')}
      </h3>
      <p className="text-matte-black-600">
        {t('wallet.nfts.no_nfts_desc', 'Seus NFTs aparecerão aqui quando você os adquirir.')}
      </p>
    </div>
  )
}

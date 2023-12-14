import React from "react";
import PropTypes from "prop-types";

import { Flex } from "@chakra-ui/react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react'
import { Heading } from '@chakra-ui/react';
import { ChevronRightIcon } from "@chakra-ui/icons";

import { translatePathNames } from "app/shared/utils";
import TypographyNeon from "app/components/TypographyNeon";

/**
 * Stili dell'header.
 */
const headerStyle = {
    width: '100%',
    backgroundColor: 'gray.900',
    padding: ' 15px 0 15px 40px',
    justifyContent: "space-between",
    alignItems: "center",
}

/**
 * Stili del contenitore sinistro dell'header.
 */
const containerLeftStyle = {
    flexDirection: "row",
    alignItems: "center",
}

/**
 * Stili del contenitore destro dell'header.
 */
const containerRightStyle = {
    flexDirection: "row",
}

/**
 * Stili del testo neon.
 * @param {string} logoTextNeonColor - Colore del testo neon.
 * @returns {Object} Stili del testo neon.
 */
const neonTextStyle = (logoTextNeonColor) => ({
    color: logoTextNeonColor,
})

/**
 * Componente Header.
 * @param {Object} props - Proprietà dell'header.
 * @param {Array} props.paths - Percorsi per la breadcrumb.
 * @param {boolean} props.logo - Indica se visualizzare il logo.
 * @param {boolean} props.logoNeon - Indica se il testo del logo deve avere effetto neon.
 * @param {string} props.logoTextNeonColor - Colore del testo neon del logo.
 * @param {string} props.logoText - Testo del logo.
 * @param {boolean} props.breadcrumb - Indica se visualizzare la breadcrumb.
 * @param {boolean} props.breadcrumbLogoText - Indica se visualizzare il testo del logo nella breadcrumb.
 * @returns {React.Element} Componente Header.
 */
function Header({
    paths,
    logo,
    logoNeon,
    logoTextNeonColor,
    logoText,
    breadcrumb,
    breadcrumbLogoText,
}) {
    /**
     * Componente LogoText.
     * @returns {React.Element} Componente LogoText.
     */
    const LogoText = () =>
        logoNeon
            ? <TypographyNeon  {...neonTextStyle(logoTextNeonColor)} text={logoText} />
            : <Heading as='h4' size='md' >{logoText}</Heading>

    /**
     * Componente BreadcumbHeader.
     * @returns {React.Element} Componente BreadcumbHeader.
     */
    const BreadcumbHeader = () =>
        <Breadcrumb separator={<ChevronRightIcon />}>
            {paths.map((path, index, paths) => (
                <BreadcrumbItem isCurrentPage={index === paths.length - 1} key={index}>
                    <BreadcrumbLink href={path !== ''
                        ? `${paths.slice(0, index).join('/')}`
                        : '/'
                    }>
                        {index === 0 && breadcrumbLogoText ? <LogoText /> : undefined}
                        {index !== 0 ? translatePathNames(path) : undefined}
                    </BreadcrumbLink>
                </BreadcrumbItem>
            ))}
        </Breadcrumb>

    return (
        <Flex {...headerStyle}>
            <Flex {...containerLeftStyle}>

                {logo && <LogoText />}
                {breadcrumb && <BreadcumbHeader />}
            </Flex>
            <Flex {...containerRightStyle}>
                {/* Contenuto aggiuntivo per il contenitore destro */}
            </Flex>
        </Flex>
    );
}

// Proprietà di Header con relative tipizzazioni.
Header.propTypes = {
    paths: PropTypes.arrayOf(PropTypes.string),
    logo: PropTypes.bool,
    logoNeon: PropTypes.bool,
    logoTextNeonColor: PropTypes.string,
    logoText: PropTypes.string,
    breadcrumb: PropTypes.bool,
    breadcrumbLogoText: PropTypes.bool,
}

// Valori predefiniti per le proprietà di Header.
Header.defaultProps = {
    paths: [],
    logo: false,
    logoNeon: false,
    logoTextNeonColor: undefined,
    logoText: undefined,
    breadcrumb: false,
    breadcrumbLogoText: false,
}

export default Header;
